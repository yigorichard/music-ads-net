import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { packages, users, promotions, platforms, balanceLogs } from "@db/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";
import { eq } from "drizzle-orm";
import { sql } from 'drizzle-orm';
import Parser from 'rss-parser';

const parser = new Parser();

// Keywords for music-related content filtering
const MUSIC_KEYWORDS = {
  english: ['music', 'song', 'album', 'artist', 'band', 'concert', 'tour', 'release', 'track'],
  turkish: ['müzik', 'şarkı', 'albüm', 'sanatçı', 'grup', 'konser', 'turne', 'çıkış', 'parça'],
  spanish: ['música', 'canción', 'álbum', 'artista', 'banda', 'concierto', 'gira', 'lanzamiento'],
  french: ['musique', 'chanson', 'album', 'artiste', 'groupe', 'concert', 'tournée', 'sortie'],
  german: ['musik', 'lied', 'album', 'künstler', 'band', 'konzert', 'tournee', 'veröffentlichung']
};

const MUSIC_NEWS_FEEDS = [
  // Americas
  {
    url: 'https://www.rollingstone.com/music/feed/',
    source: 'Rolling Stone',
    region: 'Americas',
    country: 'US',
    language: 'english'
  },
  {
    url: 'https://pitchfork.com/rss/news/',
    source: 'Pitchfork',
    region: 'Americas',
    country: 'US',
    language: 'english'
  },
  {
    url: 'https://www.billboard.com/feed/',
    source: 'Billboard',
    region: 'Americas',
    country: 'US',
    language: 'english'
  },
  // Europe
  {
    url: 'https://www.theguardian.com/music/rss',
    source: 'The Guardian',
    region: 'Europe',
    country: 'UK',
    language: 'english'
  },
  // Turkey
  {
    url: 'https://muzikonair.com/feed/',
    source: 'Muzik Onair',
    region: 'Turkey',
    country: 'TR',
    language: 'turkish'
  },
  {
    url: 'https://www.karnaval.com/feed',
    source: 'Karnaval',
    region: 'Turkey',
    country: 'TR',
    language: 'turkish'
  },
  // German
  {
    url: 'https://www.musikexpress.de/feed/',
    source: 'Musik Express',
    region: 'Europe',
    country: 'DE',
    language: 'german'
  },
  // French
  {
    url: 'https://www.lesinrocks.com/musique/feed/',
    source: 'Les Inrocks',
    region: 'Europe',
    country: 'FR',
    language: 'french'
  },
  // Spanish
  {
    url: 'https://los40.com/feed/rss/',
    source: 'Los 40',
    region: 'Europe',
    country: 'ES',
    language: 'spanish'
  }
];

const regionNames = {
  'Americas': 'The Americas',
  'Europe': 'Europe',
  'Turkey': 'Turkey',
  'AsiaPacific': 'Asia Pacific',
  'MiddleEast': 'Middle East & Africa'
};

const countryNames = {
  'US': 'United States',
  'TR': 'Turkey',
  'UK': 'United Kingdom',
  'DE': 'Germany',
  'FR': 'France',
  'ES': 'Spain'
};

// Function to check if content contains music-related keywords
function containsMusicKeywords(content: string, language: string): boolean {
  const keywords = MUSIC_KEYWORDS[language as keyof typeof MUSIC_KEYWORDS] || MUSIC_KEYWORDS.english;
  const normalizedContent = content.toLowerCase();
  return keywords.some(keyword => normalizedContent.includes(keyword.toLowerCase()));
}

export function registerRoutes(app: Express): Server {
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStoreSession({
        checkPeriod: 86400000,
      }),
      resave: false,
      secret: process.env.SESSION_SECRET || "your-secret-key",
      saveUninitialized: false,
    })
  );

  // Auth middleware to check admin status
  const isAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, req.session.userId),
      });

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      next();
    } catch (error) {
      console.error("Admin check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ message: "Tüm alanları doldurunuz" });
      }

      if (!email.includes("@")) {
        return res.status(400).json({ message: "Geçerli bir email adresi giriniz" });
      }

      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      if (existingUser) {
        return res.status(400).json({ message: "Bu email adresi zaten kayıtlı" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [user] = await db.insert(users)
        .values({
          email,
          password: hashedPassword,
          name,
          isAdmin: email === 'yigorich@gmail.com'
        })
        .returning();

      req.session.userId = user.id;

      res.json({
        message: "Kayıt başarılı",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Kayıt işlemi başarısız" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email ve şifre gerekli" });
      }

      console.log("Login attempt for:", email);

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      console.log("User found:", user ? "yes" : "no");

      if (!user) {
        return res.status(401).json({ message: "Geçersiz email veya şifre" });
      }

      try {
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log("Password validation:", password, isValidPassword ? "success" : "failed");

        if (!isValidPassword) {
          return res.status(401).json({ message: "Geçersiz email veya şifre" });
        }

        req.session.userId = user.id;
        const { password: _, ...userWithoutPassword } = user;

        res.json({
          message: "Giriş başarılı",
          user: userWithoutPassword
        });
      } catch (bcryptError) {
        console.error("Bcrypt error:", bcryptError);
        return res.status(500).json({ message: "Giriş işlemi sırasında bir hata oluştu" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Giriş yapılamadı" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Oturum açılmamış" });
    }

    try {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, req.session.userId),
        columns: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
          role: true,
          balance: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: "Kullanıcı bulunamadı" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Kullanıcı bilgileri alınamadı" });
    }
  });

  // Packages endpoints
  app.get("/api/packages", async (_req, res) => {
    try {
      const allPackages = await db.query.packages.findMany({
        orderBy: (packages, { asc }) => [asc(packages.id)],
        with: {
          platform: true
        }
      });
      res.json(allPackages);
    } catch (error) {
      console.error("Get packages error:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.get("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pkg = await db.query.packages.findFirst({
        where: (packages, { eq }) => eq(packages.id, id),
        with: {
          platform: true
        }
      });

      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }

      res.json(pkg);
    } catch (error) {
      console.error("Get package error:", error);
      res.status(500).json({ message: "Failed to fetch package" });
    }
  });
  // Admin endpoints
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      // Get total users count
      const userCount = await db.select({ count: sql`count(*)` }).from(users);

      // Get total promotions count
      const promotionCount = await db.select({ count: sql`count(*)` }).from(promotions);

      // Get active promotions count
      const activePromotions = await db.select({ count: sql`count(*)` })
        .from(promotions)
        .where(eq(promotions.status, 'active'));

      res.json({
        totalUsers: userCount[0].count,
        totalPromotions: promotionCount[0].count,
        activePromotions: activePromotions[0].count
      });
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Admin User Management
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const allUsers = await db.query.users.findMany({
        orderBy: (users, { desc }) => [desc(users.id)],
        columns: {
          id: true,
          email: true,
          name: true,
          role: true,
          isAdmin: true,
          balance: true,
          createdAt: true,
          status: true
        }
      });
      res.json(allUsers);
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const { role, isAdmin, balance, status } = req.body;

      const [updated] = await db.update(users)
        .set({
          role: role || 'user',
          isAdmin: isAdmin || false,
          balance: typeof balance === 'number' ? balance : undefined,
          status: status || 'active'
        })
        .where(eq(users.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);

    try {
      await db.delete(users).where(eq(users.id, id));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin Package Management
  app.get("/api/admin/packages", async (_req, res) => {
    try {
      const allPackages = await db.query.packages.findMany({
        orderBy: (packages, { desc }) => [desc(packages.id)],
        with: {
          platform: true
        }
      });
      res.json(allPackages);
    } catch (error) {
      console.error("Get admin packages error:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.post("/api/admin/packages", async (req, res) => {
    try {
      const [newPackage] = await db.insert(packages)
        .values({
          name: req.body.name,
          platformId: parseInt(req.body.platformId),
          price: req.body.price,
          features: req.body.features || [],
          tier: req.body.tier || 'basic'
        })
        .returning();

      const packageWithPlatform = await db.query.packages.findFirst({
        where: (packages, { eq }) => eq(packages.id, newPackage.id),
        with: {
          platform: true
        }
      });

      res.json(packageWithPlatform);
    } catch (error) {
      console.error("Create package error:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  app.patch("/api/admin/packages/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    try {
      // Validate required fields
      const { name, platformId, price, features, tier, billingPeriod } = req.body;

      if (!name || !platformId || typeof price !== 'number') {
        return res.status(400).json({
          message: "Name, platform and price are required fields"
        });
      }

      const updateData = {
        name,
        platformId: parseInt(platformId),
        price,
        features: Array.isArray(features) ? features : [],
        tier: tier || 'basic',
        billingPeriod: billingPeriod || 'monthly'
      };

      // Check if platform exists
      const platform = await db.query.platforms.findFirst({
        where: (platforms, { eq }) => eq(platforms.id, updateData.platformId)
      });

      if (!platform) {
        return res.status(400).json({ message: "Selected platform does not exist" });
      }

      const [updated] = await db
        .update(packages)
        .set(updateData)
        .where(eq(packages.id, id))
        .returning();

      const packageWithPlatform = await db.query.packages.findFirst({
        where: (packages, { eq }) => eq(packages.id, updated.id),
        with: {
          platform: true
        }
      });

      res.json(packageWithPlatform);
    } catch (error) {
      console.error("Update package error:", error);
      res.status(500).json({ message: "Failed to update package" });
    }
  });

  app.delete("/api/admin/packages/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    try {
      await db.delete(packages).where(eq(packages.id, id));
      res.json({ message: "Package deleted successfully" });
    } catch (error) {
      console.error("Delete package error:", error);
      res.status(500).json({ message: "Failed to delete package" });
    }
  });

  // Platform Management
  app.get("/api/admin/platforms", isAdmin, async (req, res) => {
    try {
      const allPlatforms = await db.query.platforms.findMany({
        orderBy: (platforms, { asc }) => [asc(platforms.name)],
      });
      res.json(allPlatforms);
    } catch (error) {
      console.error("Get platforms error:", error);
      res.status(500).json({ message: "Failed to fetch platforms" });
    }
  });

  app.post("/api/admin/platforms", isAdmin, async (req, res) => {
    try {
      const [platform] = await db.insert(platforms)
        .values({
          name: req.body.name,
          slug: req.body.slug,
          isActive: req.body.isActive ?? true
        })
        .returning();
      res.json(platform);
    } catch (error) {
      console.error("Create platform error:", error);
      res.status(500).json({ message: "Failed to create platform" });
    }
  });

  app.patch("/api/admin/platforms/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const [updated] = await db.update(platforms)
        .set({
          name: req.body.name,
          slug: req.body.slug,
          isActive: req.body.isActive
        })
        .where(eq(platforms.id, id))
        .returning();
      res.json(updated);
    } catch (error) {
      console.error("Update platform error:", error);
      res.status(500).json({ message: "Failed to update platform" });
    }
  });

  app.delete("/api/admin/platforms/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);

    try {
      // Check if platform is being used by any packages
      const packageCount = await db.select({ count: sql`count(*)` })
        .from(packages)
        .where(eq(packages.platformId, id));

      if (packageCount[0].count > 0) {
        return res.status(400).json({
          message: "Bu platform bazı paketler tarafından kullanılıyor. Önce bu paketleri silmelisiniz."
        });
      }

      await db.delete(platforms).where(eq(platforms.id, id));
      res.json({ message: "Platform başarıyla silindi" });
    } catch (error) {
      console.error("Delete platform error:", error);
      res.status(500).json({ message: "Platform silinemedi" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/promotions", isAdmin, async (req, res) => {
    try {
      const allPromotions = await db.query.promotions.findMany({
        orderBy: (promotions, { desc }) => [desc(promotions.createdAt)],
        with: {
          package: true,
          user: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      res.json(allPromotions);
    } catch (error) {
      console.error("Get admin promotions error:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  // Add endpoint for user promotions
  app.get("/api/promotions/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userPromotions = await db.query.promotions.findMany({
        where: (promotions, { eq }) => eq(promotions.userId, req.session.userId),
        orderBy: (promotions, { desc }) => [desc(promotions.createdAt)],
        with: {
          package: true,
        }
      });
      res.json(userPromotions);
    } catch (error) {
      console.error("Get user promotions error:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  // Add promotion endpoint with balance check and deduction
  app.post("/api/promotions", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { packageId, contentUrl } = req.body;

      // Get package price
      const promotionPackage = await db.query.packages.findFirst({
        where: (packages, { eq }) => eq(packages.id, packageId)
      });

      if (!promotionPackage) {
        return res.status(404).json({ message: "Package not found" });
      }

      // Get user balance
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, req.session.userId)
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.balance < promotionPackage.price) {
        return res.status(400).json({
          message: "Yetersiz bakiye",
          required: promotionPackage.price,
          current: user.balance
        });
      }

      // Create promotion and log balance change in a transaction
      const [newPromotion] = await db.transaction(async (tx) => {
        // Deduct balance
        await tx.update(users)
          .set({ balance: user.balance - promotionPackage.price })
          .where(eq(users.id, req.session.userId));

        // Create promotion
        const [promotion] = await tx.insert(promotions)
          .values({
            userId: req.session.userId,
            packageId: packageId,
            contentUrl: contentUrl,
            status: 'pending'
          })
          .returning();

        // Log balance change
        await tx.insert(balanceLogs)
          .values({
            userId: req.session.userId,
            amount: -promotionPackage.price,
            type: 'promotion_purchase',
            description: `${promotionPackage.name} paketi satın alındı`,
            referenceId: promotion.id,
            referenceType: 'promotion'
          });

        return [promotion];
      });

      const promotionWithDetails = await db.query.promotions.findFirst({
        where: (promotions, { eq }) => eq(promotions.id, newPromotion.id),
        with: {
          package: true,
          user: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      res.json(promotionWithDetails);
    } catch (error) {
      console.error("Create promotion error:", error);
      res.status(500).json({ message: "Failed to create promotion" });
    }
  });

  // Update yigorich@gmail.com to admin
  app.post("/api/admin/setup", async (req, res) => {
    try {
      await db.update(users)
        .set({
          isAdmin: true,
          role: 'admin',
          status: 'active'
        })
        .where(eq(users.email, 'yigorich@gmail.com'));

      res.json({ message: "Admin setup completed" });
    } catch (error) {
      console.error("Admin setup error:", error);
      res.status(500).json({ message: "Failed to setup admin" });
    }
  });
  // Add this endpoint to handle promotion status updates
  app.patch("/api/admin/promotions/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const [updated] = await db.update(promotions)
        .set({
          status: req.body.status,
        })
        .where(eq(promotions.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Update promotion error:", error);
      res.status(500).json({ message: "Failed to update promotion" });
    }
  });

  // Add this new endpoint for balance logs
  app.get("/api/users/balance/history", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const logs = await db.query.balanceLogs.findMany({
        where: (balanceLogs, { eq }) => eq(balanceLogs.userId, req.session.userId),
        orderBy: (balanceLogs, { desc }) => [desc(balanceLogs.createdAt)],
      });
      res.json(logs);
    } catch (error) {
      console.error("Get balance history error:", error);
      res.status(500).json({ message: "Failed to fetch balance history" });
    }
  });

  app.get("/api/news/latest", async (_req, res) => {
    try {
      const newsItems = [];

      for (const feed of MUSIC_NEWS_FEEDS) {
        try {
          const feedContent = await parser.parseURL(feed.url);
          const items = feedContent.items
            .filter(item => {
              const contentToCheck = `${item.title} ${item.content}`;
              return containsMusicKeywords(contentToCheck, feed.language);
            })
            .slice(0, 3)
            .map(item => ({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              content: item.content,
              source: feed.source,
              region: feed.region,
              regionName: regionNames[feed.region as keyof typeof regionNames],
              country: feed.country,
              countryName: countryNames[feed.country as keyof typeof countryNames],
              guid: item.guid,
              language: feed.language
            }));
          newsItems.push(...items);
        } catch (error) {
          console.error(`Error fetching ${feed.source} feed:`, error);
        }
      }

      // Group news by region
      const newsByRegion = newsItems.reduce((acc, item) => {
        const region = item.region;
        if (!acc[region]) {
          acc[region] = [];
        }
        acc[region].push(item);
        return acc;
      }, {} as Record<string, typeof newsItems>);

      // Sort news within each region by date and limit to latest 3
      Object.keys(newsByRegion).forEach(region => {
        newsByRegion[region].sort((a, b) =>
          new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime()
        );
        newsByRegion[region] = newsByRegion[region].slice(0, 3);
      });

      res.json(newsByRegion);
    } catch (error) {
      console.error("News feed error:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
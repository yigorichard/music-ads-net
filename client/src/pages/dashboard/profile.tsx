import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, X } from "lucide-react";

const socialPlatforms = [
  { id: 'spotify', name: 'Spotify' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'soundcloud', name: 'SoundCloud' },
  { id: 'tiktok', name: 'TikTok' },
] as const;

const profileSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
  role: z.enum(["user", "artist", "label", "manager"]),
  bio: z.string().optional(),
  avatarUrl: z.string().url("Geçerli bir URL giriniz").optional(),
  location: z.string().optional(),
  website: z.string().url("Geçerli bir URL giriniz").optional(),
  socialLinks: z.array(z.object({
    platform: z.enum(['spotify', 'youtube', 'instagram', 'twitter', 'facebook', 'soundcloud', 'tiktok']),
    url: z.string().url("Geçerli bir URL giriniz")
  })).optional(),
  // Role-specific fields
  artistInfo: z.object({
    genres: z.array(z.string()),
    labels: z.array(z.string()),
    instruments: z.array(z.string())
  }).optional(),
  labelInfo: z.object({
    companyName: z.string(),
    foundedYear: z.string(),
    genres: z.array(z.string())
  }).optional(),
  managerInfo: z.object({
    specialties: z.array(z.string()),
    experience: z.string()
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "user",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
      location: user?.location || "",
      website: user?.website || "",
      socialLinks: user?.socialLinks || [],
      artistInfo: user?.artistInfo || { genres: [], labels: [], instruments: [] },
      labelInfo: user?.labelInfo || { companyName: "", foundedYear: "", genres: [] },
      managerInfo: user?.managerInfo || { specialties: [], experience: "" },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Profil güncellendi" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const addSocialLink = () => {
    const currentLinks = form.getValues("socialLinks") || [];
    form.setValue("socialLinks", [...currentLinks, { platform: 'instagram', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    const currentLinks = form.getValues("socialLinks") || [];
    form.setValue("socialLinks", currentLinks.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="social">Sosyal Medya</TabsTrigger>
          <TabsTrigger value="professional">Profesyonel Bilgiler</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Profil Bilgileri</CardTitle>
                  <CardDescription>
                    Temel profil bilgilerinizi güncelleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profil Resmi URL</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İsim</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biyografi</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konum</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Sosyal Medya Bağlantıları</CardTitle>
                  <CardDescription>
                    Sosyal medya profillerinizi ekleyin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {form.watch("socialLinks")?.map((_, index) => (
                      <div key={index} className="flex gap-4">
                        <FormField
                          control={form.control}
                          name={`socialLinks.${index}.platform`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Platform seçin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {socialPlatforms.map(platform => (
                                    <SelectItem key={platform.id} value={platform.id}>
                                      {platform.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`socialLinks.${index}.url`}
                          render={({ field }) => (
                            <FormItem className="flex-[2]">
                              <FormControl>
                                <Input {...field} placeholder="https://" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSocialLink(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSocialLink}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Sosyal Medya Ekle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional">
              <Card>
                <CardHeader>
                  <CardTitle>Profesyonel Bilgiler</CardTitle>
                  <CardDescription>
                    Rolünüze özel profesyonel bilgileri düzenleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Rol seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">Kullanıcı</SelectItem>
                            <SelectItem value="artist">Sanatçı</SelectItem>
                            <SelectItem value="label">Label</SelectItem>
                            <SelectItem value="manager">Menajer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("role") === "artist" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="artistInfo.genres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Müzik Türleri</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Pop, Rock, Jazz vb."
                                value={field.value?.join(", ")}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Virgülle ayırarak birden fazla tür ekleyebilirsiniz
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="artistInfo.instruments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Çaldığınız Enstrümanlar</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Gitar, Piyano, Davul vb."
                                value={field.value?.join(", ")}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {form.watch("role") === "label" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="labelInfo.companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şirket Adı</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="labelInfo.foundedYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kuruluş Yılı</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1900" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {form.watch("role") === "manager" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="managerInfo.specialties"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Uzmanlık Alanları</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Sanatçı Yönetimi, Turne Organizasyonu vb."
                                value={field.value?.join(", ")}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="managerInfo.experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deneyim</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Müzik endüstrisindeki deneyimlerinizi anlatın..."
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Kaydet
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
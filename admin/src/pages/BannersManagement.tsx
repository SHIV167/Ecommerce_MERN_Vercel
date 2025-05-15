import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

// Banner type (sync with backend)
type Banner = {
  id?: string;
  _id?: string;
  title: string;
  subtitle?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  alt: string;
  linkUrl?: string;
  enabled: boolean;
  position: number;
};

type BannerFormProps = {
  open: boolean;
  onClose: () => void;
  onSave: (banner: Partial<Banner>, fileDesktop?: File, fileMobile?: File) => void;
  initial?: Partial<Banner>;
};

function BannerForm({ open, onClose, onSave, initial }: BannerFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [alt, setAlt] = useState(initial?.alt || "");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl || "");
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [position, setPosition] = useState(initial?.position || 0);
  const [fileDesktop, setFileDesktop] = useState<File | undefined>();
  const [fileMobile, setFileMobile] = useState<File | undefined>();
  const [desktopUrl, setDesktopUrl] = useState(initial?.desktopImageUrl || "");
  const [mobileUrl, setMobileUrl] = useState(initial?.mobileImageUrl || "");
  const [desktopOption, setDesktopOption] = useState<'upload' | 'url'>(initial?.desktopImageUrl ? 'url' : 'upload');
  const [mobileOption, setMobileOption] = useState<'upload' | 'url'>(initial?.mobileImageUrl ? 'url' : 'upload');

  // Reset on open/close
  React.useEffect(() => {
    if (open) {
      setTitle(initial?.title || "");
      setSubtitle(initial?.subtitle || "");
      setAlt(initial?.alt || "");
      setLinkUrl(initial?.linkUrl || "");
      setEnabled(initial?.enabled ?? true);
      setPosition(initial?.position || 0);
      setFileDesktop(undefined);
      setFileMobile(undefined);
      setDesktopUrl(initial?.desktopImageUrl || "");
      setMobileUrl(initial?.mobileImageUrl || "");
      setDesktopOption(initial?.desktopImageUrl ? 'url' : 'upload');
      setMobileOption(initial?.mobileImageUrl ? 'url' : 'upload');
    }
  }, [open, initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validate by selected option
    if (desktopOption==='upload' && !fileDesktop) { alert("Desktop file required"); return; }
    if (desktopOption==='url' && !desktopUrl)   { alert("Desktop URL required"); return; }
    if (mobileOption==='upload' && !fileMobile) { alert("Mobile file required"); return; }
    if (mobileOption==='url' && !mobileUrl)     { alert("Mobile URL required"); return; }
    const bannerData = { title, subtitle, alt, linkUrl, enabled, position,
      desktopImageUrl: desktopUrl, mobileImageUrl: mobileUrl };
    const sendDesktopFile = desktopOption==='upload' ? fileDesktop : undefined;
    const sendMobileFile = mobileOption==='upload' ? fileMobile : undefined;
    onSave(bannerData, sendDesktopFile, sendMobileFile);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Banner" : "Add Banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} />
          </div>
          <div>
            <Label>Alt Text</Label>
            <Input value={alt} onChange={e => setAlt(e.target.value)} required />
          </div>
          <div>
            <Label>Link URL</Label>
            <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
          </div>
          <div>
            <Label>Position</Label>
            <Input type="number" value={position} onChange={e => setPosition(Number(e.target.value))} min={0} className="w-full" />
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <Label>Desktop Image</Label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input type="radio" name="desktopOption" value="upload" checked={desktopOption==='upload'} onChange={()=>setDesktopOption('upload')} />
                    <span className="ml-2">Upload</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="desktopOption" value="url" checked={desktopOption==='url'} onChange={()=>setDesktopOption('url')} />
                    <span className="ml-2">URL</span>
                  </label>
                </div>
                {desktopOption==='upload' ? (
                  <Input type="file" accept="image/*" onChange={e => setFileDesktop(e.target.files?.[0])} className="w-full" />
                ) : (
                  <Input value={desktopUrl} onChange={e => setDesktopUrl(e.target.value)} placeholder="https://example.com/desktop.jpg" className="w-full max-w-full break-words whitespace-normal" />
                )}
                {((desktopOption==='upload' && fileDesktop) || (desktopOption==='url' && desktopUrl)) && (
                  <img
                    src={desktopOption==='upload' ? URL.createObjectURL(fileDesktop!) : desktopUrl}
                    alt={alt || "Desktop banner image"}
                    className="h-14 mt-2 rounded"
                    onError={e => { const img=e.target as HTMLImageElement; img.onerror=null; img.src=import.meta.env.BASE_URL + "placeholder-desktop.png"; }}
                  />
                )}
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Mobile Image</Label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input type="radio" name="mobileOption" value="upload" checked={mobileOption==='upload'} onChange={()=>setMobileOption('upload')} />
                    <span className="ml-2">Upload</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="mobileOption" value="url" checked={mobileOption==='url'} onChange={()=>setMobileOption('url')} />
                    <span className="ml-2">URL</span>
                  </label>
                </div>
                {mobileOption==='upload' ? (
                  <Input type="file" accept="image/*" onChange={e => setFileMobile(e.target.files?.[0])} className="w-full" />
                ) : (
                  <Input value={mobileUrl} onChange={e => setMobileUrl(e.target.value)} placeholder="https://example.com/mobile.jpg" className="w-full max-w-full break-words whitespace-normal" />
                )}
                {((mobileOption==='upload' && fileMobile) || (mobileOption==='url' && mobileUrl)) && (
                  <img
                    src={mobileOption==='upload' ? URL.createObjectURL(fileMobile!) : mobileUrl}
                    alt={alt || "Mobile banner image"}
                    className="h-14 mt-2 rounded"
                    onError={e => { const img=e.target as HTMLImageElement; img.onerror=null; img.src=import.meta.env.BASE_URL + "placeholder-mobile.png"; }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            <Label>Enabled</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initial?.id ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BannersManagement() {
  const queryClient = useQueryClient();
  // Determine API base path: in dev, Vite admin proxy uses /admin/api; in prod/SSR, use /api
  const apiBase = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL ?? '');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>();

  // --- Banner list normalization ---
  // Always ensure every banner has an 'id' property for edit/delete
  const normalizeBanners = (banners: any[]): Banner[] =>
    banners.map(b => ({ ...b, id: b.id || b._id }));

  // Fetch banners from the correct API endpoint
  const { data: bannersData = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => fetch(`${apiBase}/api/banners`).then(res => res.json()),
  });

  // Mutations for create, update, delete
  const createBanner = useMutation({
    mutationFn: (data: { banner: Partial<Banner>; fileDesktop?: File; fileMobile?: File }) => {
      const formData = new FormData();
      const { banner, fileDesktop, fileMobile } = data;
      const { title, subtitle, alt, linkUrl, enabled, position, desktopImageUrl, mobileImageUrl } = banner;
      formData.append('title', title!);
      if (subtitle !== undefined) formData.append('subtitle', subtitle!);
      formData.append('alt', alt!);
      if (linkUrl !== undefined) formData.append('linkUrl', linkUrl!);
      if (enabled !== undefined) formData.append('enabled', enabled.toString());
      if (position !== undefined) formData.append('position', position.toString());
      if (fileDesktop) {
        formData.append('desktopImage', fileDesktop);
      } else if (desktopImageUrl !== undefined) {
        formData.append('desktopImageUrl', desktopImageUrl);
      }
      if (fileMobile) {
        formData.append('mobileImage', fileMobile);
      } else if (mobileImageUrl !== undefined) {
        formData.append('mobileImageUrl', mobileImageUrl);
      }
      return fetch(`${apiBase}/api/banners`, {
        method: "POST",
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({ title: "Banner added" });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error: any) => toast({ title: (error as Error).message, variant: "destructive" }),
  });

  const updateBanner = useMutation({
    mutationFn: ({ id, banner, fileDesktop, fileMobile }: { id: string; banner: Partial<Banner>; fileDesktop?: File; fileMobile?: File }) => {
      const formData = new FormData();
      const { title, subtitle, alt, linkUrl, enabled, position, desktopImageUrl, mobileImageUrl } = banner;
      formData.append('title', title!);
      if (subtitle !== undefined) formData.append('subtitle', subtitle!);
      formData.append('alt', alt!);
      if (linkUrl !== undefined) formData.append('linkUrl', linkUrl!);
      if (enabled !== undefined) formData.append('enabled', enabled.toString());
      if (position !== undefined) formData.append('position', position.toString());
      if (fileDesktop) {
        formData.append('desktopImage', fileDesktop);
      } else if (desktopImageUrl !== undefined) {
        formData.append('desktopImageUrl', desktopImageUrl);
      }
      if (fileMobile) {
        formData.append('mobileImage', fileMobile);
      } else if (mobileImageUrl !== undefined) {
        formData.append('mobileImageUrl', mobileImageUrl);
      }
      return fetch(`${apiBase}/api/banners/${id}`, {
        method: "PUT",
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({ title: "Banner updated" });
      setFormOpen(false);
      setEditingBanner(undefined);
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error: any) => toast({ title: (error as Error).message, variant: "destructive" }),
  });

  const deleteBanner = useMutation({
    mutationFn: (id: string) => fetch(`${apiBase}/api/banners/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Banner deleted" });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: () => toast({ title: "Failed to delete banner", variant: "destructive" }),
  });

  function handleSave(banner: Partial<Banner>, fileDesktop?: File, fileMobile?: File) {
    if (editingBanner) {
      // Always use id fallback to _id
      const editId = editingBanner.id || editingBanner._id;
      updateBanner.mutate({ id: editId!, banner, fileDesktop, fileMobile });
    } else {
      createBanner.mutate({ banner, fileDesktop, fileMobile });
    }
    setFormOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-heading text-primary mb-1">Banner Management</h1>
        <Button onClick={() => { setEditingBanner(undefined); setFormOpen(true); }}>Add Banner</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Banners</CardTitle>
          <CardDescription>Manage homepage banners for your store</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th>Desktop</th>
                    <th>Mobile</th>
                    <th>Title</th>
                    <th>Alt</th>
                    <th>Enabled</th>
                    <th>Position</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bannersData?.map((banner: Banner) => (
                    <tr key={banner.id || banner._id} className="border-b">
                      <td>
                        <img
                          src={banner.desktopImageUrl}
                          alt={banner.alt ? banner.alt : "Desktop banner image"}
                          className="h-12 rounded"
                          onError={e => {
                            const img = e.target as HTMLImageElement;
                            img.onerror = null;
                            img.src = import.meta.env.BASE_URL + "placeholder-desktop.png";
                          }}
                        />
                      </td>
                      <td>
                        <img
                          src={banner.mobileImageUrl}
                          alt={banner.alt ? banner.alt : "Mobile banner image"}
                          className="h-12 rounded"
                          onError={e => {
                            const img = e.target as HTMLImageElement;
                            img.onerror = null;
                            img.src = import.meta.env.BASE_URL + "placeholder-mobile.png";
                          }}
                        />
                      </td>
                      <td>{banner.title}</td>
                      <td>{banner.alt}</td>
                      <td>
                        <Switch checked={banner.enabled} onCheckedChange={checked => updateBanner.mutate({ id: banner.id || banner._id!, banner: { enabled: checked } })} />
                      </td>
                      <td>{banner.position}</td>
                      <td>
                        {/* Disable actions if banner.id is missing */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => (banner.id || banner._id) ? (setEditingBanner(banner), setFormOpen(true)) : undefined}
                          disabled={!(banner.id || banner._id)}
                          title={(banner.id || banner._id) ? "Edit banner" : "Missing banner.id"}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const id = banner.id || banner._id;
                            if (typeof id === 'string') {
                              deleteBanner.mutate(id);
                            }
                          }}
                          className="ml-2"
                          disabled={!(banner.id || banner._id)}
                          title={(banner.id || banner._id) ? "Delete banner" : "Missing banner.id"}
                        >
                          Delete
                        </Button>
                        {!(banner.id || banner._id) && (
                          <span className="text-xs text-red-600 ml-2">Missing ID</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <BannerForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingBanner(undefined); }}
        onSave={handleSave}
        initial={editingBanner}
      />
    </div>
  );
}

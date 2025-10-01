import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { EventCategory } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    mapLink: '',
    category: 'seminar' as EventCategory,
    customCategories: [] as string[],
    customCategoryInput: '',
    entryFee: {
      isFree: true,
      amount: undefined as number | undefined,
    },
    prizeAmount: undefined as number | undefined,
    contactEmail: '',
    contactPhone: '',
    externalRegistrationLink: '',
    instagramLink: '',
    facebookLink: '',
    youtubeLink: '',
    howToRegisterLink: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    setLoading(true);
    try {
      let bannerURL = '';
      
      // Upload banner if provided
      if (bannerFile) {
        const storageRef = ref(storage, `event-banners/${Date.now()}_${bannerFile.name}`);
        await uploadBytes(storageRef, bannerFile);
        bannerURL = await getDownloadURL(storageRef);
      }

      // Create event
      await addDoc(collection(db, 'events'), {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        time: formData.time,
        location: formData.location,
        mapLink: formData.mapLink || null,
        category: formData.category,
        categories: formData.customCategories.length > 0 ? formData.customCategories : null,
        entryFee: {
          isFree: formData.entryFee.isFree,
          amount: formData.entryFee.isFree ? null : formData.entryFee.amount,
        },
        prizeAmount: formData.prizeAmount || null,
        contactInfo: {
          email: formData.contactEmail || null,
          phone: formData.contactPhone || null,
        },
        externalRegistrationLink: formData.externalRegistrationLink || null,
        mediaLinks: {
          instagram: formData.instagramLink || null,
          facebook: formData.facebookLink || null,
          youtube: formData.youtubeLink || null,
        },
        howToRegisterLink: formData.howToRegisterLink || null,
        bannerURL,
        createdBy: currentUser.uid,
        createdByName: userProfile.displayName,
        status: 'draft',
        registrations: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Event created successfully!');
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Create event error:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      mapLink: '',
      category: 'seminar',
      customCategories: [],
      customCategoryInput: '',
      entryFee: {
        isFree: true,
        amount: undefined,
      },
      prizeAmount: undefined,
      contactEmail: '',
      contactPhone: '',
      externalRegistrationLink: '',
      instagramLink: '',
      facebookLink: '',
      youtubeLink: '',
      howToRegisterLink: '',
    });
    setBannerFile(null);
  };

  const addCustomCategory = () => {
    if (formData.customCategoryInput.trim()) {
      setFormData({
        ...formData,
        customCategories: [...formData.customCategories, formData.customCategoryInput.trim()],
        customCategoryInput: '',
      });
    }
  };

  const removeCustomCategory = (index: number) => {
    setFormData({
      ...formData,
      customCategories: formData.customCategories.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new campus event
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Tech Workshop 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your event..."
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Main Auditorium"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mapLink">Google Maps Link</Label>
            <Input
              id="mapLink"
              value={formData.mapLink}
              onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
              placeholder="https://maps.google.com/..."
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Primary Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value as EventCategory })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seminar">Seminar</SelectItem>
                <SelectItem value="fest">Fest</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="competition">Competition</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Categories</Label>
            <div className="flex gap-2">
              <Input
                value={formData.customCategoryInput}
                onChange={(e) => setFormData({ ...formData, customCategoryInput: e.target.value })}
                placeholder="Add custom category"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
              />
              <Button type="button" onClick={addCustomCategory} variant="outline">
                Add
              </Button>
            </div>
            {formData.customCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.customCategories.map((cat, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm">
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCustomCategory(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Entry Fee</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="isFree"
                checked={formData.entryFee.isFree}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    entryFee: { ...formData.entryFee, isFree: checked as boolean },
                  })
                }
              />
              <label htmlFor="isFree" className="text-sm font-medium">
                Free Entry
              </label>
            </div>
            {!formData.entryFee.isFree && (
              <Input
                type="number"
                value={formData.entryFee.amount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    entryFee: { ...formData.entryFee, amount: Number(e.target.value) },
                  })
                }
                placeholder="Enter amount"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prizeAmount">Prize Amount (optional)</Label>
            <Input
              id="prizeAmount"
              type="number"
              value={formData.prizeAmount || ''}
              onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="e.g., 10000"
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Information</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="Contact Email"
              />
              <Input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="Contact Phone"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalRegistrationLink">External Registration Link</Label>
            <Input
              id="externalRegistrationLink"
              type="url"
              value={formData.externalRegistrationLink}
              onChange={(e) => setFormData({ ...formData, externalRegistrationLink: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="howToRegisterLink">How to Register Link</Label>
            <Input
              id="howToRegisterLink"
              type="url"
              value={formData.howToRegisterLink}
              onChange={(e) => setFormData({ ...formData, howToRegisterLink: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Social Media Links</Label>
            <div className="space-y-2">
              <Input
                type="url"
                value={formData.instagramLink}
                onChange={(e) => setFormData({ ...formData, instagramLink: e.target.value })}
                placeholder="Instagram URL"
              />
              <Input
                type="url"
                value={formData.facebookLink}
                onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
                placeholder="Facebook URL"
              />
              <Input
                type="url"
                value={formData.youtubeLink}
                onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                placeholder="YouTube URL"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner">Event Banner</Label>
            <Input
              id="banner"
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 1200x600px, JPG or PNG
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;

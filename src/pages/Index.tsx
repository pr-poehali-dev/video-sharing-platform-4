import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/2214f7cb-da2d-4bc1-a7f2-238770885c6e';

interface Video {
  id: number;
  title: string;
  thumbnail_url: string;
  video_url: string;
  views: number;
  created_at: string;
  user_id: number;
  author: string;
  avatar_url: string;
  likes_count: number;
  comments: Comment[];
  liked_by: number[];
}

interface Comment {
  id: number;
  text: string;
  created_at: string;
  user_id: number;
  author: string;
  avatar_url: string;
}

const Index = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [currentUser] = useState({ id: 1, name: 'Вы', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' });
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [thumbnailDialogOpen, setThumbnailDialogOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const { toast } = useToast();

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await fetch(`${API_URL}?path=videos`);
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      toast({ title: 'Ошибка загрузки видео', variant: 'destructive' });
    }
  };

  const handleLike = async (videoId: number) => {
    const video = videos.find(v => v.id === videoId);
    const isLiked = video?.liked_by?.includes(currentUser.id);

    try {
      if (isLiked) {
        await fetch(`${API_URL}?path=like`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ video_id: videoId, user_id: currentUser.id })
        });
      } else {
        await fetch(`${API_URL}?path=like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ video_id: videoId, user_id: currentUser.id })
        });
      }
      loadVideos();
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const handleAddComment = async (videoId: number) => {
    const commentText = newComment[videoId]?.trim();
    if (!commentText) return;

    try {
      await fetch(`${API_URL}?path=comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          user_id: currentUser.id,
          text: commentText
        })
      });
      setNewComment({ ...newComment, [videoId]: '' });
      loadVideos();
      toast({ title: 'Комментарий добавлен!' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newVideoTitle) {
      toast({ title: 'Введите название видео', variant: 'destructive' });
      return;
    }

    try {
      const videoBase64 = await handleFileToBase64(file);
      await fetch(`${API_URL}?path=video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newVideoTitle,
          video_url: videoBase64,
          thumbnail_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
          user_id: currentUser.id
        })
      });
      setNewVideoTitle('');
      setUploadDialogOpen(false);
      loadVideos();
      toast({ title: 'Видео загружено!' });
    } catch (error) {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const avatarBase64 = await handleFileToBase64(file);
      await fetch(`${API_URL}?path=user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          avatar_url: avatarBase64
        })
      });
      currentUser.avatar_url = avatarBase64;
      setAvatarDialogOpen(false);
      toast({ title: 'Аватар обновлен!' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedVideoId) return;

    try {
      const thumbnailBase64 = await handleFileToBase64(file);
      await fetch(`${API_URL}?path=video`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: selectedVideoId,
          thumbnail_url: thumbnailBase64
        })
      });
      setThumbnailDialogOpen(false);
      loadVideos();
      toast({ title: 'Обложка обновлена!' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const handleShare = async (video: Video) => {
    const shareData = {
      title: video.title,
      text: `Посмотрите это видео: ${video.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Ссылка скопирована!' });
      }
    } catch (error) {
      toast({ title: 'Не удалось поделиться', variant: 'destructive' });
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}М`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}К`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'сегодня';
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дней назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`;
    return `${Math.floor(diffDays / 30)} месяцев назад`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="Play" size={20} className="text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-primary">VideoSpace</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              <Icon name="Home" size={20} className="mr-2" />
              Главная
            </Button>
            
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  <Icon name="Upload" size={20} className="mr-2" />
                  Загрузить
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Загрузить видео</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Название видео"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    className="bg-muted text-foreground"
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*,image/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full"
                    disabled={!newVideoTitle}
                  >
                    <Icon name="Upload" size={20} className="mr-2" />
                    Выбрать файл
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" className="text-foreground hover:text-primary">
              <Icon name="Heart" size={20} className="mr-2" />
              Лайки
            </Button>
          </nav>

          <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
            <DialogTrigger asChild>
              <Avatar className="h-10 w-10 border-2 border-primary cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={currentUser.avatar_url} />
                <AvatarFallback>ВЫ</AvatarFallback>
              </Avatar>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle className="text-foreground">Изменить аватар</DialogTitle>
              </DialogHeader>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button onClick={() => avatarInputRef.current?.click()} className="w-full">
                <Icon name="Image" size={20} className="mr-2" />
                Выбрать фото
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {videos.map((video, index) => (
            <Card 
              key={video.id} 
              className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative group">
                <img 
                  src={video.thumbnail_url} 
                  alt={video.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-primary/90 rounded-full p-4">
                    <Icon name="Play" size={32} className="text-primary-foreground" />
                  </div>
                </div>
                {video.user_id === currentUser.id && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setSelectedVideoId(video.id);
                      setThumbnailDialogOpen(true);
                    }}
                  >
                    <Icon name="Edit" size={16} />
                  </Button>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={video.avatar_url} />
                    <AvatarFallback>{video.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1 hover:text-primary cursor-pointer transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{video.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatViews(video.views)} просмотров • {formatDate(video.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(video.id)}
                    className={`gap-2 ${video.liked_by?.includes(currentUser.id) ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <Icon 
                      name="Heart" 
                      size={20} 
                      className={video.liked_by?.includes(currentUser.id) ? 'fill-primary animate-pulse-like' : ''} 
                    />
                    <span className="font-medium">{video.likes_count}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveVideo(activeVideo === video.id ? null : video.id)}
                    className="gap-2 text-muted-foreground hover:text-primary"
                  >
                    <Icon name="MessageCircle" size={20} />
                    <span className="font-medium">{video.comments?.length || 0}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(video)}
                    className="gap-2 text-muted-foreground hover:text-primary ml-auto"
                  >
                    <Icon name="Share2" size={20} />
                  </Button>
                </div>

                {activeVideo === video.id && (
                  <div className="space-y-4 animate-scale-in">
                    <div className="space-y-3">
                      {video.comments?.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.avatar_url} />
                            <AvatarFallback>{comment.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-muted rounded-lg p-3">
                              <p className="text-sm font-medium text-foreground">{comment.author}</p>
                              <p className="text-sm text-foreground/90 mt-1">{comment.text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-3">{formatDate(comment.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar_url} />
                        <AvatarFallback>ВЫ</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          placeholder="Добавьте комментарий..."
                          value={newComment[video.id] || ''}
                          onChange={(e) => setNewComment({ ...newComment, [video.id]: e.target.value })}
                          className="min-h-[60px] resize-none bg-muted border-border text-foreground placeholder:text-muted-foreground"
                        />
                        <Button 
                          onClick={() => handleAddComment(video.id)}
                          disabled={!newComment[video.id]?.trim()}
                          size="sm"
                          className="self-end"
                        >
                          <Icon name="Send" size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={thumbnailDialogOpen} onOpenChange={setThumbnailDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Изменить обложку видео</DialogTitle>
          </DialogHeader>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
          />
          <Button onClick={() => thumbnailInputRef.current?.click()} className="w-full">
            <Icon name="Image" size={20} className="mr-2" />
            Выбрать фото
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

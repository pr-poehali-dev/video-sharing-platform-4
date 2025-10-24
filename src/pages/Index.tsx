import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Video {
  id: number;
  title: string;
  author: string;
  avatar: string;
  thumbnail: string;
  views: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

const Index = () => {
  const [videos, setVideos] = useState<Video[]>([
    {
      id: 1,
      title: 'Космические путешествия в 2024',
      author: 'Космонавт Иван',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ivan',
      thumbnail: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80',
      views: '1.2М',
      timestamp: '2 дня назад',
      likes: 15420,
      isLiked: false,
      comments: [
        {
          id: 1,
          author: 'Мария К.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
          text: 'Потрясающее видео! Хочу в космос! 🚀',
          timestamp: '1 час назад'
        }
      ]
    },
    {
      id: 2,
      title: 'Обзор новых технологий',
      author: 'Техно Блог',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      views: '856К',
      timestamp: '5 дней назад',
      likes: 8930,
      isLiked: false,
      comments: []
    },
    {
      id: 3,
      title: 'Красота океана в 4K',
      author: 'Природа HD',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nature',
      thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      views: '2.1М',
      timestamp: '1 неделю назад',
      likes: 24680,
      isLiked: false,
      comments: [
        {
          id: 1,
          author: 'Алексей П.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
          text: 'Невероятная красота!',
          timestamp: '3 дня назад'
        },
        {
          id: 2,
          author: 'Света Н.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sveta',
          text: 'Смотрела уже 5 раз, не могу оторваться',
          timestamp: '2 дня назад'
        }
      ]
    },
    {
      id: 4,
      title: 'Урок программирования для начинающих',
      author: 'Код Мастер',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coder',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
      views: '543К',
      timestamp: '3 дня назад',
      likes: 12340,
      isLiked: false,
      comments: []
    }
  ]);

  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [currentUser] = useState({
    name: 'Вы',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
  });

  const handleLike = (videoId: number) => {
    setVideos(videos.map(video => {
      if (video.id === videoId) {
        return {
          ...video,
          isLiked: !video.isLiked,
          likes: video.isLiked ? video.likes - 1 : video.likes + 1
        };
      }
      return video;
    }));
  };

  const handleAddComment = (videoId: number) => {
    const commentText = newComment[videoId]?.trim();
    if (!commentText) return;

    setVideos(videos.map(video => {
      if (video.id === videoId) {
        const newCommentObj: Comment = {
          id: Date.now(),
          author: currentUser.name,
          avatar: currentUser.avatar,
          text: commentText,
          timestamp: 'только что'
        };
        return {
          ...video,
          comments: [...video.comments, newCommentObj]
        };
      }
      return video;
    }));

    setNewComment({ ...newComment, [videoId]: '' });
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
            <Button variant="ghost" className="text-foreground hover:text-primary">
              <Icon name="User" size={20} className="mr-2" />
              Профиль
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              <Icon name="Heart" size={20} className="mr-2" />
              Лайки
            </Button>
          </nav>

          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>ВЫ</AvatarFallback>
          </Avatar>
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
              <div className="relative group cursor-pointer">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-primary/90 rounded-full p-4">
                    <Icon name="Play" size={32} className="text-primary-foreground" />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={video.avatar} />
                    <AvatarFallback>{video.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1 hover:text-primary cursor-pointer transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{video.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {video.views} просмотров • {video.timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(video.id)}
                    className={`gap-2 ${video.isLiked ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <Icon 
                      name="Heart" 
                      size={20} 
                      className={video.isLiked ? 'fill-primary animate-pulse-like' : ''} 
                    />
                    <span className="font-medium">{video.likes.toLocaleString()}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveVideo(activeVideo === video.id ? null : video.id)}
                    className="gap-2 text-muted-foreground hover:text-primary"
                  >
                    <Icon name="MessageCircle" size={20} />
                    <span className="font-medium">{video.comments.length}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-primary ml-auto"
                  >
                    <Icon name="Share2" size={20} />
                  </Button>
                </div>

                {activeVideo === video.id && (
                  <div className="space-y-4 animate-scale-in">
                    <div className="space-y-3">
                      {video.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-muted rounded-lg p-3">
                              <p className="text-sm font-medium text-foreground">{comment.author}</p>
                              <p className="text-sm text-foreground/90 mt-1">{comment.text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-3">{comment.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar} />
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
    </div>
  );
};

export default Index;

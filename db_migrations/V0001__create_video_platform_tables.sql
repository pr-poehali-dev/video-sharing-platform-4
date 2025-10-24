CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    thumbnail_url TEXT,
    video_url TEXT,
    user_id INTEGER REFERENCES users(id),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(video_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id),
    user_id INTEGER REFERENCES users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_video_id ON likes(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);

INSERT INTO users (name, avatar_url) 
SELECT * FROM (VALUES 
    ('Вы', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'),
    ('Космонавт Иван', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ivan'),
    ('Техно Блог', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech'),
    ('Природа HD', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nature'),
    ('Код Мастер', 'https://api.dicebear.com/7.x/avataaars/svg?seed=coder')
) AS v(name, avatar_url)
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

INSERT INTO videos (title, thumbnail_url, video_url, user_id, views) 
SELECT * FROM (VALUES 
    ('Космические путешествия в 2024', 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80', '', 2, 1200000),
    ('Обзор новых технологий', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', '', 3, 856000),
    ('Красота океана в 4K', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', '', 4, 2100000),
    ('Урок программирования для начинающих', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80', '', 5, 543000)
) AS v(title, thumbnail_url, video_url, user_id, views)
WHERE NOT EXISTS (SELECT 1 FROM videos LIMIT 1);

INSERT INTO likes (video_id, user_id) 
SELECT * FROM (VALUES 
    (1, 1), (1, 2), (2, 3), (3, 1), (3, 4), (4, 2)
) AS v(video_id, user_id)
WHERE NOT EXISTS (SELECT 1 FROM likes LIMIT 1);

INSERT INTO comments (video_id, user_id, text) 
SELECT * FROM (VALUES 
    (1, 1, 'Потрясающее видео! Хочу в космос! 🚀'),
    (3, 2, 'Невероятная красота!'),
    (3, 3, 'Смотрела уже 5 раз, не могу оторваться')
) AS v(video_id, user_id, text)
WHERE NOT EXISTS (SELECT 1 FROM comments LIMIT 1);
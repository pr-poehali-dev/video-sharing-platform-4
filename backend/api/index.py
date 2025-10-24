'''
Business: API для работы с видео, пользователями, лайками и комментариями
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с данными из БД
'''

import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(
        os.environ['DATABASE_URL'],
        cursor_factory=RealDictCursor
    )

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('queryStringParameters', {}).get('path', '')
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            if path == 'videos':
                cur.execute('''
                    SELECT 
                        v.id, v.title, v.thumbnail_url, v.video_url, v.views, v.created_at,
                        u.id as user_id, u.name as author, u.avatar_url,
                        COUNT(DISTINCT l.id) as likes_count
                    FROM videos v
                    LEFT JOIN users u ON v.user_id = u.id
                    LEFT JOIN likes l ON v.id = l.video_id
                    GROUP BY v.id, u.id
                    ORDER BY v.created_at DESC
                ''')
                videos = cur.fetchall()
                
                for video in videos:
                    cur.execute('''
                        SELECT c.id, c.text, c.created_at,
                               u.id as user_id, u.name as author, u.avatar_url
                        FROM comments c
                        LEFT JOIN users u ON c.user_id = u.id
                        WHERE c.video_id = %s
                        ORDER BY c.created_at DESC
                    ''', (video['id'],))
                    video['comments'] = cur.fetchall()
                    
                    cur.execute('''
                        SELECT user_id FROM likes WHERE video_id = %s
                    ''', (video['id'],))
                    video['liked_by'] = [row['user_id'] for row in cur.fetchall()]
                
                result = videos
                
            elif path == 'user':
                user_id = event.get('queryStringParameters', {}).get('id', '1')
                cur.execute('SELECT * FROM users WHERE id = %s', (user_id,))
                result = cur.fetchone()
            
            else:
                result = {'error': 'Unknown path'}
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            if path == 'video':
                cur.execute('''
                    INSERT INTO videos (title, thumbnail_url, video_url, user_id)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                ''', (
                    body.get('title'),
                    body.get('thumbnail_url'),
                    body.get('video_url'),
                    body.get('user_id', 1)
                ))
                result = {'id': cur.fetchone()['id']}
                conn.commit()
            
            elif path == 'like':
                try:
                    cur.execute('''
                        INSERT INTO likes (video_id, user_id)
                        VALUES (%s, %s)
                        ON CONFLICT (video_id, user_id) DO NOTHING
                        RETURNING id
                    ''', (body.get('video_id'), body.get('user_id', 1)))
                    new_like = cur.fetchone()
                    conn.commit()
                    result = {'success': True, 'liked': new_like is not None}
                except Exception as e:
                    result = {'success': False, 'error': str(e)}
            
            elif path == 'comment':
                cur.execute('''
                    INSERT INTO comments (video_id, user_id, text)
                    VALUES (%s, %s, %s)
                    RETURNING id
                ''', (
                    body.get('video_id'),
                    body.get('user_id', 1),
                    body.get('text')
                ))
                result = {'id': cur.fetchone()['id']}
                conn.commit()
            
            else:
                result = {'error': 'Unknown path'}
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            
            if path == 'like':
                cur.execute('''
                    DELETE FROM likes 
                    WHERE video_id = %s AND user_id = %s
                    RETURNING id
                ''', (body.get('video_id'), body.get('user_id', 1)))
                deleted = cur.fetchone()
                conn.commit()
                result = {'success': True, 'unliked': deleted is not None}
            else:
                result = {'error': 'Unknown path'}
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            
            if path == 'user':
                cur.execute('''
                    UPDATE users 
                    SET avatar_url = %s
                    WHERE id = %s
                    RETURNING id
                ''', (body.get('avatar_url'), body.get('user_id', 1)))
                result = {'success': True}
                conn.commit()
            
            elif path == 'video':
                cur.execute('''
                    UPDATE videos 
                    SET thumbnail_url = %s
                    WHERE id = %s
                    RETURNING id
                ''', (body.get('thumbnail_url'), body.get('video_id')))
                result = {'success': True}
                conn.commit()
            
            else:
                result = {'error': 'Unknown path'}
        
        else:
            result = {'error': 'Method not allowed'}
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, default=str),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

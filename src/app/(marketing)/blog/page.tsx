'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  readTime?: number;
  publishedAt: string;
}

export default function BlogListing() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog'],
    queryFn: async () => {
      const res = await api.get('/blog');
      return res.data.data as BlogPost[];
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-[#0EA5A0]" />
          MediMind AI Blog
        </h1>
        <p className="text-[#64748B] max-w-2xl mx-auto">
          Expert insights on AI in healthcare, clinical decision support, and modern medical technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))
        ) : posts && posts.length > 0 ? (
          posts.map(post => (
            <article
              key={post._id}
              className="bg-[#1A2942] rounded-xl border border-[#64748B]/20 overflow-hidden flex flex-col hover:border-[#0EA5A0]/50 transition-colors"
            >
              <div className="h-48 bg-gradient-to-br from-[#0EA5A0]/20 to-[#0F1A2E] relative overflow-hidden">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-[#0EA5A0]/30" />
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3">
                  {post.category && <Badge variant="default">{post.category}</Badge>}
                  {post.readTime && (
                    <span className="text-xs text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime} min read
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-white mb-2 leading-snug">{post.title}</h2>
                {post.excerpt && (
                  <p className="text-[#64748B] text-sm mb-4 flex-grow line-clamp-3">{post.excerpt}</p>
                )}

                <div className="mt-auto pt-4 border-t border-[#64748B]/20 flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">
                    {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-[#0EA5A0] hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    Read More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-[#64748B]">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#64748B]/50" />
            <p>No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

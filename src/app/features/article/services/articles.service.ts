import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { ArticleListConfig } from "../models/article-list-config.model";
import { Article } from "../models/article.model";

@Injectable({ providedIn: "root" })
export class ArticlesService {
  constructor() {}

  // Mock Data
  private mockArticles: Article[] = [
    {
      slug: "article-1",
      title: "Introduction to Angular",
      description: "A beginner's guide to Angular development.",
      body: "This article covers the basics of Angular, including components, modules, and services.",
      tagList: ["Angular", "Frontend"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorited: false,
      favoritesCount: 10,
      author: {
        username: "johndoe",
        bio: "Frontend developer",
        image: "https://via.placeholder.com/150",
        following: false,
      },
    },
    {
      slug: "article-2",
      title: "Advanced TypeScript",
      description: "Master TypeScript with advanced concepts.",
      body: "This article delves deep into TypeScript, including generics, decorators, and type inference.",
      tagList: ["TypeScript", "Backend"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorited: true,
      favoritesCount: 25,
      author: {
        username: "janedoe",
        bio: "Backend engineer",
        image: "https://via.placeholder.com/150",
        following: true,
      },
    },
  ];

  query(
    config: ArticleListConfig,
  ): Observable<{ articles: Article[]; articlesCount: number }> {
    // Simulate filtering and pagination logic
    let filteredArticles = this.mockArticles;

    // if (config.filters.tag) {
    //   filteredArticles = filteredArticles.filter((article) =>
    //     article.tagList.includes(config.filters.tag),
    //   );
    // }

    const limit = config.filters.limit || filteredArticles.length;
    const offset = config.filters.offset || 0;

    const paginatedArticles = filteredArticles.slice(offset, offset + limit);

    return of({
      articles: paginatedArticles,
      articlesCount: filteredArticles.length,
    });
  }

  get(slug: string): Observable<Article> {
    const article = this.mockArticles.find((article) => article.slug === slug);
    if (!article) {
      throw new Error(`Article with slug ${slug} not found`);
    }
    return of(article);
  }

  delete(slug: string): Observable<void> {
    this.mockArticles = this.mockArticles.filter(
      (article) => article.slug !== slug,
    );
    return of(void 0);
  }

  create(article: Partial<Article>): Observable<Article> {
    const newArticle: Article = {
      ...article,
      slug: article.title?.toLowerCase().replace(/ /g, "-") || "new-article",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tagList: article.tagList || [],
      favorited: false,
      favoritesCount: 0,
      author: {
        username: "mockuser",
        bio: "Mock User Bio",
        image: "https://via.placeholder.com/150",
        following: false,
      },
    } as Article;

    this.mockArticles.push(newArticle);
    return of(newArticle);
  }

  update(article: Partial<Article>): Observable<Article> {
    const existingArticle = this.mockArticles.find(
      (a) => a.slug === article.slug,
    );
    if (!existingArticle) {
      throw new Error(`Article with slug ${article.slug} not found`);
    }
    Object.assign(existingArticle, article, { updatedAt: new Date().toISOString() });
    return of(existingArticle);
  }

  favorite(slug: string): Observable<Article> {
    const article = this.mockArticles.find((article) => article.slug === slug);
    if (!article) {
      throw new Error(`Article with slug ${slug} not found`);
    }
    article.favorited = true;
    article.favoritesCount += 1;
    return of(article);
  }

  unfavorite(slug: string): Observable<void> {
    const article = this.mockArticles.find((article) => article.slug === slug);
    if (!article) {
      throw new Error(`Article with slug ${slug} not found`);
    }
    article.favorited = false;
    article.favoritesCount -= 1;
    return of(void 0);
  }
}

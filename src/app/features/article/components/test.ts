import { Component, Input, OnInit } from "@angular/core";
import { ArticlesService } from "../services/articles.service";
import { ArticleListConfig } from "../models/article-list-config.model";
import { Article } from "../models/article.model";
import { ArticlePreviewComponent } from "./article-preview.component";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { LoadingState } from "../../../core/models/loading-state.model";
import { BehaviorSubject, combineLatest, map, Observable, switchMap } from "rxjs";

@Component({
  selector: "app-article-list",
  template: `
    <div *ngIf="loading$ | async as loading">
      <div class="article-preview" *ngIf="loading === LoadingState.LOADING">
        Loading articles...
      </div>

      <ng-container *ngIf="loading === LoadingState.LOADED">
        <ng-container *ngIf="articles$ | async as articles">
          <ng-container *ngIf="articles.length; else noArticles">
            <ng-container *ngFor="let article of articles; trackBy: trackBySlug">
              <app-article-preview [article]="article"></app-article-preview>
            </ng-container>
          </ng-container>
        </ng-container>

        <nav>
          <ul class="pagination">
            <li
              *ngFor="let pageNumber of totalPages$ | async"
              class="page-item"
              [ngClass]="{ active: pageNumber === (currentPage$ | async) }"
            >
              <button
                class="page-link"
                (click)="setPageTo(pageNumber)"
              >
                {{ pageNumber }}
              </button>
            </li>
          </ul>
        </nav>
      </ng-container>
    </div>

    <ng-template #noArticles>
      <div class="article-preview">No articles are here... yet.</div>
    </ng-template>
  `,
  imports: [ArticlePreviewComponent, NgForOf, NgClass, NgIf],
  standalone: true,
})
export class ArticleListComponent implements OnInit {
  @Input() limit!: number;

  private configSubject = new BehaviorSubject<ArticleListConfig | null>(null);
  private currentPageSubject = new BehaviorSubject<number>(1);

  query$ = this.configSubject.asObservable();
  currentPage$ = this.currentPageSubject.asObservable();

  articles$: Observable<Article[]> = combineLatest([
    this.query$,
    this.currentPage$,
  ]).pipe(
    switchMap(([query, currentPage]) => {
      if (!query || !this.limit) return [];
      const offset = this.limit * (currentPage - 1);
      const filters = { ...query.filters, limit: this.limit, offset };
      const updatedQuery = { ...query, filters };
      return this.articlesService.query(updatedQuery).pipe(
        map((data) => data.articles)
      );
    })
  );

  totalPages$: Observable<number[]> = combineLatest([
    this.query$,
    this.currentPage$,
  ]).pipe(
    switchMap(([query]) => {
      if (!query || !this.limit) return [];
      return this.articlesService.query(query).pipe(
        map((data) => {
          const totalPages = Math.ceil(data.articlesCount / this.limit);
          return Array.from({ length: totalPages }, (_, i) => i + 1);
        })
      );
    })
  );

  loading$ = this.articles$.pipe(
    map(() => LoadingState.LOADED),
    switchMap(() => this.query$.pipe(map(() => LoadingState.LOADING)))
  );

  LoadingState = LoadingState;

  constructor(private articlesService: ArticlesService) {}

  @Input()
  set config(config: ArticleListConfig) {
    this.configSubject.next(config);
    this.setPageTo(1); // Reset to the first page on config change
  }

  ngOnInit(): void {}

  setPageTo(pageNumber: number) {
    this.currentPageSubject.next(pageNumber);
  }

  trackBySlug(index: number, article: Article) {
    return article.slug;
  }
}

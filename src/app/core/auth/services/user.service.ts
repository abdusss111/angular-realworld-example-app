import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, of } from "rxjs";
import { map, distinctUntilChanged, tap, shareReplay } from "rxjs/operators";
import { JwtService } from "./jwt.service";
import { User } from "../user.model";
import { Router } from "@angular/router";

const mockUser: User = {
  email: "example@mail.com",
  token: "mock-token",
  username: "johndoe",
  bio: "A brief biography",
  image: "https://example.com/avatar.jpg",
  password: "password123",
};

@Injectable({ providedIn: "root" })
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  public isAuthenticated = this.currentUser.pipe(map((user) => !!user));

  constructor(
    private readonly jwtService: JwtService,
    private readonly router: Router,
  ) {}

  /**
   * Mock login method for Task 2
   */
  
  login(credentials: { email: string; password: string }): Observable<{ user: User }> {
    if (credentials.email === mockUser.email && credentials.password === mockUser.password) {
      return of({ user: mockUser }).pipe(
        tap(({ user }) => this.setAuth(user))
      );
    } else {
      return of({ user: mockUser }).pipe(
        tap(() => {
          console.error("Invalid credentials");
          // this.purgeAuth();
        })
      );
    }
  }

  register(credentials: { username: string; email: string; password: string }): Observable<{ user: User }> {
    // This is just a placeholder and could also use mock logic if needed
    return of({ user: { ...mockUser, ...credentials } }).pipe(
      tap(({ user }) => this.setAuth(user))
    );
  }

  logout(): void {
    this.purgeAuth();
    void this.router.navigate(["/"]);
  }

  getCurrentUser(): Observable<{ user: User }> {
    // Return the mock user as the current user for simplicity
    return of({ user: mockUser }).pipe(
      tap(({ user }) => this.setAuth(user)),
      shareReplay(1),
    );
  }

  update(user: Partial<User>): Observable<{ user: User }> {
    const updatedUser = { ...mockUser, ...user };
    return of({ user: updatedUser }).pipe(
      tap(({ user }) => this.setAuth(user))
    );
  }

  setAuth(user: User): void {
    this.jwtService.saveToken(user.token);
    this.currentUserSubject.next(user);
  }

  purgeAuth(): void {
    this.jwtService.destroyToken();
    this.currentUserSubject.next(null);
  }
}

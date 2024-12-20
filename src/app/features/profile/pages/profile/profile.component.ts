import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { catchError, switchMap } from "rxjs/operators";
import { combineLatest, of, throwError } from "rxjs";
import { UserService } from "../../../../core/auth/services/user.service";
import { Profile } from "../../models/profile.model";
import { ProfileService } from "../../services/profile.service";
import { AsyncPipe, NgIf } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FollowButtonComponent } from "../../components/follow-button.component";
import { mockUser } from "../../user";

@Component({
  selector: "app-profile-page",
  templateUrl: "./profile.component.html",
  imports: [
    FollowButtonComponent,
    NgIf,
    RouterLink,
    AsyncPipe,
    RouterLinkActive,
    RouterOutlet,
    FollowButtonComponent,
  ],
  standalone: true,
})
export class ProfileComponent implements OnInit {
  profile!: Profile | null; 
  isUser: boolean = false;
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  ngOnInit() {
    const username = this.route.snapshot.params["username"];

    // Check if the URL matches the mock user condition
    if (username === "johndoe") {
      this.profile = mockUser;
      this.isUser = true; // Adjust as needed for your UI logic
    } else {
      this.profile = null; // Represents "Wrong user"
    }
  }

  onToggleFollowing(profile: Profile) {
    this.profile = profile;
  }
}

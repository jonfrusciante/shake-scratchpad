import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs/Subject';
import {MediaService} from '../../../core/media.service';
import {OrgService} from '../org.service';


@Component({
  selector: 'sk-org-admin-users',
  templateUrl: './org-admin-users.component.html',
  styleUrls: ['./org-admin-users.component.scss']
})
export class OrgAdminUsersComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  orgId: string;

  constructor(private mediaService: MediaService,
              private orgService: OrgService,
              // private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit() {

    // get current org
    this.orgService.getCurrentOrg$()
      .takeUntil(this.destroy$)
      .subscribe(org => {
        this.orgId = org;

        this.mediaService.getSmallScreen$()
          .takeUntil(this.destroy$)
          .subscribe(isSmallScreen => {
            if (isSmallScreen) {
              this.router.navigate([`org/${this.orgId}/too-small`])
                .catch(err => console.log(err));
            }
          });
      });
  }

  ngOnDestroy() {
    // force unsubscribe
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }

}

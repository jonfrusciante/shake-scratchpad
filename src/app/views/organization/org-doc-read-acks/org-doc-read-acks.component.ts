import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {Subject} from 'rxjs/Subject';
import {OrgDocService} from '../org-doc.service';
import {OrgService} from '../org.service';
import {Org} from '../../../model/org';
import {Router} from "@angular/router";

export interface OrgAcks {
  name: string;
  dateCreated: object;
  isActive: boolean;
  requiredSignatures: number;
  actualSignatures: number;
}
@Component({
  selector: 'sk-org-doc-read-acks',
  templateUrl: './org-doc-read-acks.component.html',
  styleUrls: ['./org-doc-read-acks.component.scss']
})
export class OrgDocReadAcksComponent implements OnInit, OnDestroy {

  readAcksDisplayColumns = ['name', 'docName', 'date Created', 'required Signatures', 'actual Signatures', 'isActive', 'Actions'];
  readAcksDataSource = new MatTableDataSource<OrgAcks>();
  activeReadAcks;
  allReadAcks;

  destroy$: Subject<boolean> = new Subject<boolean>();
  orgId: string;

  constructor(private orgService: OrgService,
              public router: Router,
              private orgDocService: OrgDocService) { }

  ngOnInit() {
    this.orgService.getCurrentOrg$()
      .takeUntil(this.destroy$)
      .subscribe(res => {
        this.orgId = res;

        this.orgDocService.getOrgDocsAcks$(this.orgId)
          .takeUntil(this.destroy$)
          .subscribe(readAcks => {
            this.allReadAcks  = readAcks;
          });

        this.orgDocService.getActiveOrgDocsAcks$(this.orgId)
          .takeUntil(this.destroy$)
          .subscribe(readAcks => {
            this.activeReadAcks  = readAcks;
            this.readAcksDataSource.data = this.activeReadAcks;
          });
      });
  }

  readAckDelete(readAck) {
    this.orgDocService.deleteOrgDocAckP(this.orgId, readAck.id);
  }

  addReadAck() {
    this.router.navigate([`org/${this.orgId}/org-doc-read-ack`, '']);
  }

  editReadAck(readAck) {
    this.router.navigate([`org/${this.orgId}/org-doc-read-ack`, readAck.id]);

  }

  applyFilterFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.readAcksDataSource.filter = filterValue;
  }

  activeOnlyChanged(event) {
    if (event.checked) {
      this.readAcksDataSource.data = this.activeReadAcks;
    } else {
      this.readAcksDataSource.data = this.allReadAcks;
    }
  }
  ngOnDestroy() {
    // force unsubscribe
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }
}

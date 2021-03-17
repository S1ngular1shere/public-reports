import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PublicReportComponent} from './public-report.component'
const routes: Routes = [
  {
      path: '',
      component: PublicReportComponent
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicReportRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentsRoutingModule } from './students-routing-module';
import { StudentsShell } from './students-shell/students-shell';
import { StudentList } from './student-list/student-list';
import { StudentDetail } from './student-detail/student-detail';

@NgModule({
  declarations: [StudentsShell, StudentList, StudentDetail],
  imports: [CommonModule, StudentsRoutingModule],
})
export class StudentsModule {}

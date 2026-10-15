import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentsShell } from './students-shell/students-shell';
import { StudentList } from './student-list/student-list';
import { StudentDetail } from './student-detail/student-detail';

const routes: Routes = [
  {
    path: '',
    component: StudentsShell,
    children: [
      // /students -> the list (default child)
      { path: '', component: StudentList },
      // /students/:id -> a single student's detail (parameterized route)
      { path: ':id', component: StudentDetail },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentsRoutingModule {}

import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import * as html2pdf from 'html2pdf.js'

import feature_data from '../../../assets/JSON/39_features.json';
import interaction_data from '../../../assets/JSON/interactions.json';
import inventive_principle_data from '../../../assets/JSON/inventive_principle.json';

const { read, write, utils } = XLSX;

@Component({
  selector: 'app-tdipm-app-triz',
  templateUrl: './tdipm-app-triz.component.html',
  styleUrls: ['./tdipm-app-triz.component.scss']
})
export class TdipmAppTrizComponent implements OnInit {
  // Material Dialog
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('editCompanyModal', { static: false }) editCompanyModal: TemplateRef<any>;
  @ViewChild('editInventiveModal', { static: false }) editInventiveModal: TemplateRef<any>;
  private editCompanyDialogRef: MatDialogRef<TemplateRef<any>>;
  private editInventiveDialogRef: MatDialogRef<TemplateRef<any>>;

  // private member variables such as the number of contradictions
  form = {
    cntOfContradictions: 0,
    currentRadioValue: -1,
    inventive: {
      radioValue: -1,
      list: []
    }
  };
  inputData = {
    designParameters: []
  };
  // store the json data to member variable
  jsonData = {
    featureData: [],
    interaction_data: [],
    inventive_principle_data: []
  };
  // the variables to store the data to LocalStorage
  modelData = {
    collapse: [],
    mainData: []
  };

  constructor(public dialog: MatDialog, private router: Router) { }

  // Show the dialog in order to edit two improving feature and worsening feature
  openDialog(ind: number, type: string, resolved: boolean) {
    if ( resolved ) {
      return;
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.restoreFocus = false;
    dialogConfig.autoFocus = false;
    dialogConfig.role = 'dialog';

    if (type === 'improving') {
      this.form.currentRadioValue = this.modelData.mainData[ind].original.improving.selTriz;
    } else {
      this.form.currentRadioValue = this.modelData.mainData[ind].original.worsening.selTriz;
    }

    this.editCompanyDialogRef = this.dialog.open(this.editCompanyModal, dialogConfig);

    this.editCompanyDialogRef.afterClosed().subscribe(result => {
      if (type === 'improving') {
        this.modelData.mainData[ind].original.improving.selTriz = this.form.currentRadioValue;
      } else {
        this.modelData.mainData[ind].original.worsening.selTriz = this.form.currentRadioValue;
      }
    });
  }

  // Show the dialog for editing inventive principle
  openInventiveDialog(ind: number) {
    const col = this.modelData.mainData[ind].original.improving.selTriz;
    const row = this.modelData.mainData[ind].original.worsening.selTriz;
    // Validation check related to improving feature or worsening feature values
    if (col === -1) {
      alert('Please select the correct TRIZ Equivalent Feature of Improving Feature row by clicking the cell');
      return;
    }
    if (row === -1) {
      alert('Please select the correct TRIZ Equivalent Feature of Worsening Feature row by clicking the cell');
      return;
    }
    const interaction = this.jsonData.interaction_data[col - 1][row - 1];
    // initialize the Inventive Principle Dialog values from JSON data
    this.form.inventive.list = this.jsonData.inventive_principle_data.filter(item => interaction.includes(item['no']));
    this.form.inventive.radioValue = this.modelData.mainData[ind].triz.selTriz;

    if (this.form.inventive.list.length === 0) {
      alert('There are no intersection of the "Improving Feature" and "Worsening Feature" in the "Contradiction Table');
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.restoreFocus = false;
    dialogConfig.autoFocus = false;
    dialogConfig.role = 'dialog';

    this.editInventiveDialogRef = this.dialog.open(this.editInventiveModal, dialogConfig);

    this.editInventiveDialogRef.afterClosed().subscribe(result => {
      this.modelData.mainData[ind].triz.selTriz = this.form.inventive.radioValue;
    });
  }

  ngOnInit() {
    const modelDataStr = localStorage.getItem('modelData');
    // get the data of design parameters from hoq model data in LocalStorage
    if (modelDataStr) {
      const modelData = JSON.parse(modelDataStr);
      const designParameters = modelData.designParameters;
      this.inputData.designParameters = designParameters;
      this.inputData.designParameters = this.inputData.designParameters.filter(x => x.name.replace(' ') !== '');
      // if there are no rows in design parameters, fill in list with N/A
      if (this.inputData.designParameters.length === 0) {
        this.inputData.designParameters.push({ name: 'N/A' });
      }
    }
    // get json data from JSON files
    this.jsonData.featureData = feature_data;
    this.jsonData.interaction_data = interaction_data;
    this.jsonData.inventive_principle_data = inventive_principle_data;

    // get the model data saved in LocalStorage
    const tmodelData = localStorage.getItem('modelData_TRIZ');
    if (tmodelData) {
      this.modelData = JSON.parse(tmodelData);
    }
    const tformData = localStorage.getItem('form_TRIZ');
    if (tformData) {
      this.form = JSON.parse(tformData);
    }
  }
  // whening selecting the number of contradiction via input box on top-banner
  selectChangeHandler() {
    // initialize the modelData for storing to localStorage as the count of contradiction
    const cntOfContradictions: number = Number(this.form.cntOfContradictions);
    this.modelData.collapse = Array(cntOfContradictions).fill(false);
    this.modelData.mainData = Array(cntOfContradictions).fill({}).map(e => e = {
      original: {
        improving: {
          selHoq: 0,
          selTriz: -1,
          note: '',
        },
        worsening: {
          selHoq: 0,
          selTriz: -1,
          note: '',
        },
      },
      triz: {
        selTriz: -1,
        note: ''
      },
      updated: {
        improving: {
          hoq: '',
          nochange: false,
        },
        worsening: {
          hoq: '',
          nochange: false,
        },
      },
      resolved: false
    });
  }
  onResolvedChange(ind: number) {
    this.modelData.mainData[ind].resolved = !this.modelData.mainData[ind].resolved;
  }
  // when clicking "start over" button for reseting values
  clearAllContradictions() {
    this.form.cntOfContradictions = 0;
    this.selectChangeHandler();
  }
  // when clicking download excel button for downloading excel file from offline resources
  downloadExcel() {
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = 'assets/excel/TRIZ-Table.xlsx';
    // link.download = path;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  // download PDF from html content
  downloadPDF() {
    this.modelData.collapse.fill(true);

    var opt = {
      margin: 0.8,
      filename: 'myfile.pdf',
      pagebreak: { mode: 'legacy', before: '#page2el' },
      image: { type: 'jpeg', quality: 0.99 },
      html2canvas: { scale: 1, logging: true, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    const element = this.content.nativeElement;
    var worker = html2pdf();
    worker = worker.set(opt);
    worker = worker.from(element);
    worker.save();
  }
  // when clicking navigate button at the bottom of page, switch the route to HOQ
  navigateHOQ() {
    //store the modelData to LocalStorage before navigating
    localStorage.setItem('modelData_TRIZ', JSON.stringify(this.modelData));
    localStorage.setItem('form_TRIZ', JSON.stringify(this.form));
    localStorage.setItem('inputData_TRIZ', JSON.stringify(this.inputData));
    //navgiate to HOQ
    this.router.navigateByUrl('/hoq');
  }
}

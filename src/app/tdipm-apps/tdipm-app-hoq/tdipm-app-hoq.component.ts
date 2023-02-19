import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';
import * as html2pdf from 'html2pdf.js'
import { Router } from '@angular/router';

@Component({
  selector: 'app-tdipm-app-hoq',
  templateUrl: './tdipm-app-hoq.component.html',
  styleUrls: ['./tdipm-app-hoq.component.scss']
})
export class TdipmAppHoqComponent implements OnInit {
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @ViewChild('downloadLink', { static: false }) downloadLink: ElementRef;

  contextMenuPosition = { x: '0px', y: '0px' };
  isContextMenuOpen = false;
  clickedItem: any = {
    type: '',
    context: {},
    value: ''
  };
  form = {
    customerRequirementCount: 5,
    technicalRequirementCount: 5,
    competitiveComparisonCount: 4,
  };
  inputData = {
    customerRequirementCount: 5,
    technicalRequirementCount: 5,
    competitiveComparisonCount: 4,
    totalRowCount: 0,
    totalColumnCount: 0
  };
  modelData = {
    // technicaRelationships: [*, **, -, --, ]
    technicaRelationships: [
      [{ relation: '+' }, { relation: '+' }, { relation: '+' }, { relation: '+' }, { relation: '+' }],
      [{ relation: '+' }, { relation: '+' }, { relation: '+' }, { relation: '+' }, { relation: '+' }],
      [{ relation: '+' }, { relation: '+' }, { relation: '+' }, { relation: '+' }, { relation: '+' }],
      [{ relation: '+' }, { relation: '+' }, { relation: '+' }, { relation: '+' }, { relation: '+' }],
      [{ relation: '+' }, { relation: '+' }, { relation: '+' }, { relation: '+' }, { relation: '+' }]
    ],
    // designParameters: [inc, dec, x]
    designParameters: [
      { name: 'parameter1', key: 'inc' },
      { name: 'parameter2', key: 'dec' },
      { name: 'parameter3', key: 'x' },
      { name: 'parameter4', key: 'dec' },
      { name: 'parameter5', key: 'inc' }
    ],
    competitiveComparison: [
      { name: 'our company1' },
      { name: 'our company2' },
      { name: 'our company3' },
      { name: 'our company4' }
    ],
    // technicalRequirements: [strong, normal, low, none]
    customerRequirements: [
      { name: 'customer requirement1', priorityRating: 6, rating: 10, technicalRequirements: ['none', 'none', 'none', 'none', 'none'], customerScore: 0, competitiveComparison: [{ value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }] },
      { name: 'customer requirement2', priorityRating: 4, rating: 20, technicalRequirements: ['none', 'none', 'none', 'none', 'none'], customerScore: 0, competitiveComparison: [{ value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }] },
      { name: 'customer requirement3', priorityRating: 3, rating: 30, technicalRequirements: ['none', 'none', 'none', 'none', 'none'], customerScore: 0, competitiveComparison: [{ value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }] },
      { name: 'customer requirement4', priorityRating: 2, rating: 20, technicalRequirements: ['none', 'none', 'none', 'none', 'none'], customerScore: 0, competitiveComparison: [{ value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }] },
      { name: 'customer requirement5', priorityRating: 9, rating: 10, technicalRequirements: ['none', 'none', 'none', 'none', 'none'], customerScore: 0, competitiveComparison: [{ value: 2 }, { value: 2 }, { value: 2 }, { value: 2 }] },
    ],
    technicalTotals: { priorityRating: 32, rating: 100, designParameters: [53, 339, 222, 332, 123] },
    technicalRanking: { priorityRating: 'N/A', rating: 'N/A', designParameters: [3, 10, 11, 12, 23] },
    targetValues: { priorityRating: 'N/A', rating: 'N/A', designParameters: [2, 0.2, 15, 88, 15] }
  }
  constructor(private renderer: Renderer2, private router: Router) {
    this.renderer.listen('window', 'click', (e: Event) => {
      this.isContextMenuOpen = false;
    });
  }

  ngOnInit() {
    // Get modelData from LocalStorage
    const formStr = localStorage.getItem('form');
    if (formStr) {
      this.form = JSON.parse(formStr);
    }
    this.generateModel();
    const modelDataStr = localStorage.getItem('modelData');
    if (modelDataStr) {
      this.modelData = JSON.parse(modelDataStr);
    }
  }

  technicalTableWidth() {
    return this.inputData.technicalRequirementCount * 28 + 'px';
  }
  technicalTableWrapperHeight() {
    return (Math.max(144, this.inputData.technicalRequirementCount * 28*0.707106)) + 'px';
  }

  generateModel() {
    // inputData
    this.inputData.customerRequirementCount = Number(this.form.customerRequirementCount);
    this.inputData.technicalRequirementCount = Number(this.form.technicalRequirementCount);
    this.inputData.competitiveComparisonCount = Number(this.form.competitiveComparisonCount);

    this.inputData.totalRowCount = 3 + this.inputData.customerRequirementCount + 3;
    this.inputData.totalColumnCount = 2 + 2 + this.inputData.technicalRequirementCount + this.inputData.competitiveComparisonCount;


    // ** modelData
    // relationships
    let requirementCount = this.inputData.technicalRequirementCount
    let competitiveCount = this.inputData.competitiveComparisonCount
    this.modelData.technicaRelationships = Array(requirementCount).fill(Array(requirementCount).fill({}).map(x => x = { relation: '' }));

    // design parameters
    this.modelData.designParameters = Array(requirementCount).fill({}).map(x => x = { name: '', key: 'inc' });

    // competitive comparison
    this.modelData.competitiveComparison = Array(competitiveCount).fill({}).map(x => x = { name: '', value: 0 });

    // customer requirements
    this.modelData.customerRequirements = Array(this.inputData.customerRequirementCount)
      .fill({})
      .map(x => x =
      {
        name: '',
        priorityRating: 0,
        rating: 0,
        customerScore: 0,
        technicalRequirements: Array(requirementCount).fill('none'),
        competitiveComparison: Array(competitiveCount).fill({ value: 0 })
      });
    // technical totals
    this.modelData.technicalTotals = { priorityRating: 0, rating: 0, designParameters: Array(requirementCount).fill(0) }
    this.modelData.technicalRanking = { priorityRating: 'N/A', rating: 'N/A', designParameters: Array(requirementCount).fill(0) }
    this.modelData.targetValues = { priorityRating: 'N/A', rating: 'N/A', designParameters: Array(requirementCount).fill(0) }

    this.modelData = JSON.parse(JSON.stringify(this.modelData));
  }

  onContextMenu(event: MouseEvent, type: string, context: any) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';

    this.clickedItem.type = type;
    this.clickedItem.context = context;
    if (this.clickedItem.type == 'technical-requirement') {
      const row = this.clickedItem.context.row
      const col = this.clickedItem.context.col
      this.clickedItem.value = this.modelData.customerRequirements[row].technicalRequirements[col];
    } else if (this.clickedItem.type == 'direction-improvement') {
      const col = this.clickedItem.context.col
      this.clickedItem.value = this.modelData.designParameters[col].key
    }
    this.isContextMenuOpen = true;
  }

  onContextMenuAction(value: any) {
    if (this.clickedItem.type == 'technical-requirement') {
      const row = this.clickedItem.context.row
      const col = this.clickedItem.context.col
      this.modelData.customerRequirements[row].technicalRequirements[col] = value
    } else if (this.clickedItem.type == 'direction-improvement') {
      const col = this.clickedItem.context.col
      this.modelData.designParameters[col].key = value
    }
    this.calcTotal()
  }

  getTechnicalValueFromKey(key) {
    switch (key) {
      case 'strong': return 9;
      case 'normal': return 3;
      case 'low': return 1;
      case 'none': return 0;
    }
    return 0;
  }
  calcTotal() {

    let priorityRatingTotal = 0;
    let ratingTotal = 0;

    // calc 
    for (let j = 0; j < this.inputData.customerRequirementCount; j++) {
      const priorityRating = this.modelData.customerRequirements[j].priorityRating;
      priorityRatingTotal = priorityRatingTotal + Number(priorityRating);
      this.modelData.technicalTotals.priorityRating = priorityRatingTotal
    }

    for (let j = 0; j < this.inputData.customerRequirementCount; j++) {
      const priorityRating = this.modelData.customerRequirements[j].priorityRating;
      const rating = Number(priorityRatingTotal) > 0 ? (priorityRating * 100 / Number(priorityRatingTotal)).toFixed(0) : 0;
      this.modelData.customerRequirements[j].rating = Number(rating);
      ratingTotal = ratingTotal + Number(rating);
      this.modelData.technicalTotals.priorityRating = priorityRatingTotal;
      this.modelData.technicalTotals.rating = ratingTotal > 0 ? 100 : 0;

      let customerScore = 0;
      for (let i = 0; i < this.inputData.technicalRequirementCount; i++) {
        customerScore = customerScore + this.getTechnicalValueFromKey(this.modelData.customerRequirements[j].technicalRequirements[i]);
      }
      this.modelData.customerRequirements[j].customerScore = customerScore;
    }

    for (let i = 0; i < this.inputData.technicalRequirementCount; i++) {
      let techTotal = 0;
      let paramSum = 0;
      for (let j = 0; j < this.inputData.customerRequirementCount; j++) {
        let rating = this.modelData.customerRequirements[j].rating;
        let technicalValue = this.getTechnicalValueFromKey(this.modelData.customerRequirements[j].technicalRequirements[i])
        techTotal = techTotal + technicalValue * rating;
        paramSum = paramSum + technicalValue;
      }
      this.modelData.technicalTotals.designParameters[i] = techTotal;
      const techRanking = Math.round(techTotal / (paramSum == 0 ? 1 : paramSum));
      this.modelData.technicalRanking.designParameters[i] = techRanking;
    }
  }
  // make, download the pdf from the HTML content when clicking "Print to PDF" button

  downloadPDF() {
    let opt = {
      margin: 0.8,
      filename: 'myfile.pdf',
      pagebreak: { mode: 'legacy', before: '#page2el' },
      image: { type: 'jpeg', quality: 0.99 },
      html2canvas: { scale: 1, logging: true, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    const element = this.content.nativeElement;
    let worker = html2pdf();
    worker = worker.set(opt);
    worker = worker.from(element);
    worker.save();
  }

  navigateTRIZ() {
    localStorage.setItem('form', JSON.stringify(this.form));
    localStorage.setItem('modelData', JSON.stringify(this.modelData));
    this.router.navigateByUrl('/triz');
  }
}

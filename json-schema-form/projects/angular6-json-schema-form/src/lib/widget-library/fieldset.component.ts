import { Component, Input, OnInit } from '@angular/core';

import { JsonSchemaFormService } from '../json-schema-form.service';

@Component({
  selector: 'fieldset-widget',
  template: `
    <fieldset
      [class]="options?.htmlClass"
      [class.expandable]="options?.expandable"
      [class.expanded]="options?.expandable && expanded"
      [disabled]="options?.readonly">
      <legend *ngIf="options?.title && layoutNode?.type !== 'tab'"
        class = "field-title main-title"
        [class.sr-only]="options?.notitle"
        [innerHTML]="setTitle(layoutNode, 0)"
        (click)="expand()"></legend>

        <root-widget *ngIf="expanded"
          [layout]="layoutNode.items"
          [dataIndex]="dataIndex"
          [layoutIndex]="layoutIndex"
          [isOrderable]="options?.orderable"></root-widget>

    </fieldset>`,
  styles: [],
})
export class FieldsetComponent implements OnInit {
  /* */
   options: any;
   expanded = true;

  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options;
    this.expanded = this.options.expanded != undefined ? this.options.expanded : true;
  }

   expand() {
    if (this.options.expandable) { this.expanded = !this.expanded; }
  }

   setTitle(item: any = null, index: number = null): string {
    return this.jsf.setArrayItemTitle(this, item, index);
  }
}

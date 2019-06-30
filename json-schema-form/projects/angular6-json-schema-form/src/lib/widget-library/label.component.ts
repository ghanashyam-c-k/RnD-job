import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { JsonSchemaFormService } from '../json-schema-form.service';

@Component({
  selector: 'label-widget',
  template: `
    <section  *ngIf ="showDiv" [class]="options?.htmlClass">
    <div>
    <label
        [attr.for]="'control' + layoutNode?._id"
        class ="captionReadonlyTitle"
        [class.sr-only]="options?.notitle"
        [innerHTML]="options?.title"></label>
    </div>
    <div>
      <label style="font-weight:normal;"
        [id]="'control' + layoutNode?._id"
        [style.width]="'100%'"
        [innerHTML]="controlValue ? controlValue : null">
    </label>
    </div>
    </section>`,
  styles: [`input { margin-top: 6px; }`],
})
export class LabelComponent implements OnInit {
  private formControl: AbstractControl;
  private controlName: string;
  private controlValue: any;
  private controlDisabled = false;
  private boundControl = false;
  private options: any;
  private autoCompleteList: string[] = [];

  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];
  showDiv = false;

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options;
    // this.controlValue = "";
    this.jsf.initializeControl(this);
    if (this.controlValue !== undefined && this.controlValue !== null) {
      this.showDiv = true;
    }
  }

  private updateValue(event) {
    this.jsf.updateValue(this, event.target.value);
  }
}

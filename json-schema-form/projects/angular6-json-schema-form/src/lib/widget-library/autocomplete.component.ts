import { Component, Input, OnInit, NgZone } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { JsonSchemaFormService } from '../json-schema-form.service';
import { buildTitleMap } from '../shared/index';

@Component({
  selector: 'autocomplete-widget',
  template: `
  <div
      [class]="options?.htmlClass"
     >
        <div class = "customBgDiv" >
          <label *ngIf="options?.title"
          [class]="options?.labelHtmlClass"
          [class.sr-only]="options?.notitle"
          [innerHTML]="options?.title"></label>
          <div ngui-auto-complete
            class="autoCompleteDiv"
            [accept-user-input]="true"
            [source]="arrayOfStrings"
            placeholder="enter text">
            <input
              [class.not-picked]="isNotPicked"
              [value]="controlValue"
              (keyup.enter)="valueChanged($event)"
              (click)="valueChanged($event)"
              (input)="valueChanged($event)"
              (blur)="valueChanged($event)"
              class="form-control"
            />
          </div>
        </div>
    </div>
    `,
    styles: [`
    .not-picked {
      color: #ff4444 !important;
    }
  `]

})
export class AutoCompleteComponent implements OnInit {
   controlValue: any;
   controlDisabled = false;
   isNotPicked = false;
  @Input() layoutNode: any;
  arrayOfStrings: any = [];
  arrayOfValues: any = [];
   options: any;
  private selectList: any[] = [];   // Used for handling logics.. Not unused.

  constructor(
    private jsf: JsonSchemaFormService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options;
    this.arrayOfValues = buildTitleMap(
      this.options.titleMap || this.options.enumNames,
      this.options.enum,
      !!this.options.required
    );
    // Push the values to ddl
    for (let i = 0; i < this.arrayOfValues.length; i++) {
      if (this.arrayOfValues[i].value !== null) {
        this.arrayOfStrings.push(this.arrayOfValues[i].name);
      }
    }
    /// Initialize
    this.jsf.initializeControl(this);
    // Added the value to ddl if not available...
    // if (this.arrayOfStrings.indexOf(this.controlValue) === -1 && this.controlValue != null) {
      this.validate(this.controlValue);
      // #. this.arrayOfStrings.push(this.controlValue);
    // }
  }
  // Save the value selected
  valueChanged(event) {
    this.validate(event.target.value);
    this.jsf.updateValue(this, event.target.value);
  }

  private validate(value: string) {
    this.ngZone.run(() => {
      this.isNotPicked = this.arrayOfStrings.indexOf(value) === -1;
    });
  }
}

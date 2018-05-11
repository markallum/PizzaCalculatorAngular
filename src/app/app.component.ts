import { Component, OnInit } from '@angular/core';
import { CalculatorService } from './calculator.service';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Pizza Calculator';
  setForm: FormGroup;
  calculateSubscription: Subscription;

  constructor(private calculatorService: CalculatorService) { }

  ngOnInit() {
    this.setupForm();
  }

  addSet() {
    this.createSet();
  }

  deleteSet(index: number) {
    const arr: FormArray = (<FormArray>this.setForm.get('sets'));
    arr.removeAt(index);
  }

  onSubmit() {
    const arr: FormArray = (<FormArray>this.setForm.get('sets'));
  }

  patchResult(group: FormGroup, result: string) {
    group.patchValue({
      'pricePerInch': result
    })
  }
  
  calculateResult(group: FormGroup) {
    // const groupAtIndex: FormGroup = 
    //   (<FormGroup>(<FormArray>this.setForm.get('sets')).controls[index]);
    
    const size = group.get('size').value;
    const price = group.get('price').value;
    const quantity = group.get('quantity').value;

    const totalSize = size * quantity;
    const radius = totalSize / 2;
    const area = Math.PI * (radius * radius); 
    // * 100 to convert result to pennies from pounds (or equivalent currency)
    // 10.18p is easier to work with mathmatically than £0.1018
    const pricePerInch = (price / area) * 100;

    let result;
    // regex to trim pricePerInch down to 2 deicmal places without rounding
    if (!isNaN(pricePerInch)) {
      result = pricePerInch.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
    } else {
      result = ":(";
    }

    // save to form for comparison
    this.patchResult(group, result);
  }

  priceValidator(control: FormControl): {[s: string]: boolean } {
    if (control.value <= 0) {
      return {'priceIsLessThanZero': true};
    } else {
      return null;
    }
  }

  createSet() {
    const newGroup: FormGroup = new FormGroup({
      'size': new FormControl(0, [Validators.required, Validators.min(1)]),
      'price': new FormControl(0, [Validators.required, this.priceValidator]),
      'quantity': new FormControl(1, [Validators.required, Validators.min(1)]),
      'pricePerInch': new FormControl(4000)
    });

    

    (<FormArray>this.setForm.get('sets')).push(
      newGroup
    );

    const calculateNewResult = () => {
      console.log('value change');
       setTimeout( () => {
        if (newGroup.valid) {
          this.calculateResult(newGroup);
        } else {
          this.patchResult(newGroup, "4000");
        }
       });
      
    }

    newGroup.controls.size.valueChanges.subscribe(
      () => {
        calculateNewResult();
      }
    );

    newGroup.controls.price.valueChanges.subscribe(
      () => {
        calculateNewResult();
      }
    );

    newGroup.controls.quantity.valueChanges.subscribe(
      () => {
        calculateNewResult();
      }
    );
    // newGroup.controls.size.valueChanges.subscribe(
    //   () => { calculateNewResult() } 
    // );

    // newGroup.controls.price.valueChanges.subscribe(
    //   () => { calculateNewResult() } 
    // );

    // newGroup.controls.quantity.valueChanges.subscribe(
    //   () => { calculateNewResult() } 
    // );

    // newGroup.statusChanges.subscribe(
    //   (status) => {
    //     let valueSubscription: Subscription;
    //     if (status === "VALID") {
    //       calculateNewResult();
    //       valueSubscription = newGroup.controls.size.valueChanges.subscribe(
    //         () => {
    //           calculateNewResult();
    //         }
    //       );
    //     } else {
    //       if (valueSubscription) {
    //         valueSubscription.unsubscribe();
    //       }
    //     }
    //   }
    // );

    
  }


  private setupForm() {

    let sets = new FormArray([]);

    this.setForm = new FormGroup({
      'sets': sets
    });

    this.createSet();

  }
}

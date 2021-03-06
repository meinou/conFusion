import { Component, OnInit, Input, Inject } from '@angular/core';

import { Dish } from '../shared/dish';
import { DISHES } from '../shared/dishes';
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchmap';

import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

import { trigger, state, style, animate, transition} from '@angular/animations'
import {visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
      '@flyInOut': 'true',
      'style': 'display: block'   
  },
  animations: [
    flyInOut(),
    visibility(),
    expand()
  ]
 
})

export class DishdetailComponent implements OnInit {
  //@Input()
  dish : Dish;
  dishcopy = null;

  dishIds: number[];
  prev: number;
  next: number;
  started: boolean = false;
  errMsg: string;
  visibility = 'shown';

  commentForm: FormGroup;
  comment: Comment;
  formErrors = {
    'comment' : '',
    'author' : '',
    'rating': 0,
    'date': ''
  }

  validationMessages = {
    'comment': {
      'required':      'Comment is required.',
      'minlength':     'Comment must be at least 2 characters long.',
      'maxlength':     'Comment cannot be more than 25 characters long.'
    },
    'author': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    }
  };
  
  constructor(private dishService: DishService, 
              private location: Location,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              @Inject('BaseURL') private BaseURL ) {
                // this.createForm();
               }

  ngOnInit() {
    this.createForm();

   this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
   this.route.params
     .switchMap((params: Params) =>  { 
       this.visibility = 'hidden'; 
       return this.dishService.getDish(+params['id']); 
      })
     .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
                errmess => this.errMsg = <any>errmess);    
  }

  createForm(){
    //this.comment = this.commentForm.value;
    var d = new Date();
  //  this.comment.date = d.toISOString;
    var date = d.toISOString();
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: 5,
      date: d
    });

    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any){
    if (!this.commentForm) return;

    const form = this.commentForm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  onSubmit(){
    this.comment = this.commentForm.value;
    var d = new Date();
  //  this.comment.date = d.toISOString;
    var date = d.toISOString();
    

    //console.log(this.comment);
    this.dishcopy.comments.push(this.comment);
    this.dishcopy.save()
    .subscribe(dish => this.dish = dish);

    this.commentForm.reset({
      author:'',
      comment:'',
      rating: 5,
      date: date
    });
  }

  setPrevNext(dishId: number) {
    let index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
  }

  goBack(): void{
    this.location.back();
  }

}

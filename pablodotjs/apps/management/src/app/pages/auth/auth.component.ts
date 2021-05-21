import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { MadPandaImage } from './mad-panda-image';

@Component({
  selector: 'pablodotjs-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {

  authForm!: FormGroup;
  src: string = MadPandaImage;

  constructor(
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.authForm = this.formBuilder.group({
      email: new FormControl(null, [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  handleAuthSubmit() {
    console.log('authForm submit: ', this.authForm);
  }
}

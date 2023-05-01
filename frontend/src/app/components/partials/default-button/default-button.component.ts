import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'default-button',
  templateUrl: './default-button.component.html',
  styleUrls: ['./default-button.component.css']
})
export class DefaultButtonComponent implements OnInit {

  @Input()
  type: 'submit' | 'button' = 'submit';
  @Input()
  text:string = 'Submit';
  @Input()
  marginRem = 1;
  @Input()
  padding:string = "1.2em 3.4em"
  @Input()
  borderRadRem:string = "0.8";
  @Input()
  color = 'white';
  @Input()
  bgColor:string = 'var(--col1)';
  @Input()
  bgColorHover:string = 'var(--col2)'
  @Input()
  fontSizeRem = 1.3;
  @Input()
  widthRem = 12;
  @Input()
  heightRem = 3.5;
  @Input()
  showQuant = 0;
  @Input()
  QuantityVal = 0;
  @Output()
  onClick = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

}

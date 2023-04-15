import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  @Input() userImage: SafeUrl | null = null;
  @Input() buttonText: string = 'Add Image';
  @Output() imageSelected = new EventEmitter<File>();
  isImageSelected = false;
  @ViewChild('fileInput') fileInput: ElementRef | undefined;

  constructor(private toastrService:ToastrService) {}
  ngOnInit(): void{
    // getting image from localstorage if already exists
    if(this.userImage){
      this.isImageSelected = true;
    }
  }
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file && ['image/jpeg', 'image/png'].includes(file.type)) {
      if(file.size < 2 * 1024 * 1024){
        const reader = new FileReader();
        reader.onload = () => {
          this.userImage = reader.result as string;

        };
        reader.readAsDataURL(file);
        this.isImageSelected = true;
        this.imageSelected.emit(file);
      }else{
        this.toastrService.error('Please select an image file with a size less than 2MB.');
      }
    } else{
      this.toastrService.error('Please select a JPEG or PNG image file.');
      return;
    }
  }
  triggerClick() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }
}

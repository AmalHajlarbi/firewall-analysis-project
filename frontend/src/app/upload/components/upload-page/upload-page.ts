import { ChangeDetectorRef,OnInit, Component,signal } from '@angular/core';
import { Upload } from '../../services/upload';
import { FirewallType } from '../../enums/FirewallType.enum';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadResponse } from '../../interfaces/upload.interfaces';
import { Router } from '@angular/router';
import { Store} from '../../../store/store';


@Component({
  selector: 'app-upload-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-page.html',
  styleUrl: './upload-page.css',
})
export class UploadPage {
  
  
  selectedFile!: File | null;
  firewallType: FirewallType | null = null;
  supportedTypes: FirewallType[] = [];
  isUploading = signal(false);
  uploadResult = signal<UploadResponse | undefined>(undefined)
  errorMessage = signal<string | undefined>(undefined);

/////////////////////////////
constructor(
  private uploadService: Upload,
  private cdr: ChangeDetectorRef,
  private router: Router,
  public store: Store
) {}


  ngOnInit() {
    this.loadSupportedFirewallTypes();
    
  }

  uploadLogs() {
    if (!this.selectedFile || !this.firewallType) {
      this.errorMessage.set('File or firewall missing');
      return;
    }

    this.isUploading.set(true);

    this.uploadService.uploadLog(this.selectedFile, this.firewallType)
      .subscribe({
        next: res => {
          this.uploadResult.set(res);
          this.isUploading.set(false);
          console.log('Upload successful:', res);
          this.store.setFilters({ fileId: res.fileId });
          localStorage.setItem('lastFileId', res.fileId);
          if(res.linesProcessed > 0) {
            setTimeout(() => {
    this.router.navigate(['/logs'], {
      queryParams: {
        fileId: res.fileId   
      }
    });
  }, 1000);
          }

          
},
        error: err => {
          this.errorMessage.set(err.message);
          this.isUploading.set(false);
        }
      });
  }

  loadSupportedFirewallTypes() {
    this.uploadService.getSupportedFirewallTypes()
      .subscribe({
        next: types => {
          this.supportedTypes = types;
          this.store.setSupportedFirewallTypes(types);
          
        },
        error: err => this.errorMessage.set(err.message),
      });
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set('File > 10 Mo');
      return;
    }

    if (!file.name.match(/\.(log|txt)$/)) {
      this.errorMessage.set('Invalid format (.log / .txt)');
      return;
    }

    this.selectedFile = file;
    this.errorMessage.set(undefined);
  }

  


}

import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-audio-recording',
  templateUrl: './audio-recording.component.html',
  styleUrls: ['./audio-recording.component.css']
})

export class AudioRecordingComponent implements OnInit {
  @Output() audioRecorded: EventEmitter<Blob> = new EventEmitter<Blob>();
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: any[] = [];
  private mediaStream: MediaStream | null = null;
  public isRecording: boolean = false;
  public audioUrl: string | null = null;
  private audioBlob: Blob | null = null;

  constructor() {}
  ngOnInit(): void {}
  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }
  startRecording() {
    this.audioUrl = null; // Reset audio URL before starting a new recording
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Request permission to access the microphone
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.mediaStream = stream;  // Save the stream for later use
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        // On data available (audio is being recorded), push it to audioChunks
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
            // Update the audio URL with the current chunks in real-time
            this.audioUrl = URL.createObjectURL(new Blob(this.audioChunks, { type: 'audio/webm' }));
          }
        };
        // When the recording stops, create an audio Blob and set the audio URL
        this.mediaRecorder.onstop = () => {
         
          this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.audioRecorded.emit(this.audioBlob); 
          this.audioUrl = URL.createObjectURL(this.audioBlob);  // Final audio URL
          // if (this.audioBlob) {
          //   this.audioRecorded.emit(this.audioBlob);  // Emit the captured audio
          // }
        };
        // Start recording
        this.mediaRecorder.start(10);  // Collect audio in small chunks (10ms)
        this.isRecording = true;
      }).catch((err) => {
        console.error("Error accessing microphone", err);
      });
    }
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stopStreamTracks(); 
    }
  }

  discardRecording() {
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioUrl = null;
    this.isRecording = false;
    
    // If a media recorder was active, stop it
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      
    }
    
    // Stop the microphone stream tracks to release the microphone access
    this.stopStreamTracks();

    // Reset mediaRecorder for a fresh start
    this.mediaRecorder = null;
  }

  // Helper method to stop the microphone tracks and release the stream
  private stopStreamTracks() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;  // Reset the stream
    }
  }

  playRecording() {
    if (this.audioUrl) {
      const audio = new Audio(this.audioUrl);
      audio.play();
    }
  }

  downloadRecording() {
    if (this.audioBlob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(this.audioBlob);
      a.download = 'recording.webm';
      a.click();
    }
  }
  resetAudio() {
    this.discardRecording();  // Discard any ongoing or recorded audio
    this.isRecording = false; // Reset the recording flag
    this.audioUrl = null;     // Clear the audio URL
    this.audioBlob = null;    // Clear the audio Blob
  }
  
}

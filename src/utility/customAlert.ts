import Swal from 'sweetalert2';

type CallbackFunction = () => void;

// Replace standard alert with SweetAlert
export const showAlert = (title:string,message: string, callback?: CallbackFunction): void => {
 
    Swal.fire({
      title: title?.toLocaleUpperCase(),
      text: message,
      icon: 'info',
      confirmButtonText: 'OK'
    }).then((result:any) => {
      // Check if the "OK" button is clicked
      if (result.isConfirmed) {
        // Execute the custom callback function
        if (callback && typeof callback === 'function') {
          callback();
        }
      }
    });
  }
  
  
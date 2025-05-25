import { LightningElement, wire, track } from 'lwc';
import getDonorsWithPayments from '@salesforce/apex/DonorPaymentsController.getDonorsWithPayments';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import updatePayments from '@salesforce/apex/DonorPaymentsController.updatePayments';



export default class DonorPayments extends LightningElement {
    console.log('IN DONOR PAYMENTS LIGHTNING ELEMENT');
    
    draftValuesMap = {};
    @track donors;
    columns = [
        { label: 'Amount', fieldName: 'Amount__c', type: 'currency', editable: true },
        { label: 'Payment Date', fieldName: 'Payment_Date__c', type: 'date', editable: true },
        { label: 'Project Name', fieldName: 'projectName', type: 'text' } 
    ];

    @wire(getDonorsWithPayments)
    wiredDonors({ value }) {
        console.log('IM IN WIRED DONORS');
            const { data, error } = value || {};
            if (data) {
                console.log('has data: ' + data);
                // handle data
            } else if (error) {
                console.log('has error: ' + error);
                // handle error
            }
        }
        // this.wiredDonorResult = value; 
        // const {error, data} = value || {};
        // if (data) {
        //     console.log('Donors data received:', data);
        //     this.donors = data.map(donor => ({
        //         ...donor,
        //         draftValues: [],
        //         payments: donor.payments.map(payment => {
        //             // Check if Project__r is available in the payment object
        //             const projectName = payment.Project__r ? payment.Project__r.Name : '—'; // Default to '—' if project is not found
        //             console.log('Processed Payment:', payment); // Log each payment object
    
        //             // Add the projectName to the payment object
        //             const paymentWithProject = {
        //                 ...payment,
        //                 projectName: projectName
        //             };
    
        //             return paymentWithProject;
        //         })
        //     }));
        //     this.error = undefined;
        // } else if (error) {
        //     this.error = error; // Set the error
        //     this.donors = undefined; // Reset donors if error occurs
        // }
    

    handleCellChange(event) {
        console.log('DRAFTVALUESMAP: ' + this.draftValuesMap);
        const contactId = event.target.dataset.contactId;
        this.draftValuesMap[contactId] = event.detail.draftValues;
        const updatedDrafts = event.detail.draftValues;
        console.log('UPDATED DRAFTS IN HANDLE CELL CHANGE: ' + updatedDrafts);
        // Update the draftValues array on the correct donor
        this.donors = this.donors.map(donor => {
            if (donor.contactId === contactId) {
                return {
                    ...donor,
                    draftValues: updatedDrafts
                };
            }
            return donor;
        });
    }

    

    handleSave(event) {
        

        const contactId = event.target.dataset.contactId;
        const draftValues = this.draftValuesMap[contactId] || [];
        console.log('DRAFTVALUESMAP: ' + this.draftValuesMap);
        console.log('CONTACT ID: ' + contactId);
        console.log('DRAFT VALUES: ' + draftValues);

        if (!draftValues.length) return;

        // Call Apex method to update payments
        updatePayments({ updatedPayments: draftValues })
            .then(() => {
                // Show success message
                this.showToast('Success', 'Payments updated successfully', 'success');
    
                // Clear the draft values for that donor
                this.draftValuesMap[contactId] = [];

            return refreshApex(this.wiredDonorResult);
                
            })
            .catch(error => {
                // Show error message
                this.showToast('Error updating payments', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(evt);
    }


}

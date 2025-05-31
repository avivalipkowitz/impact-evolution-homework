import { LightningElement, wire, track } from 'lwc';
import getDonorsWithPayments from '@salesforce/apex/DonorPaymentsController.getDonorsWithPayments';
import updatePayments from '@salesforce/apex/DonorPaymentsController.updatePayments';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';




export default class Donations extends LightningElement {
    @track donors;
    @track error;

    columns = [
        { label: 'Amount', fieldName: 'Amount__c', type: 'currency', editable: true},
        { label: 'Payment Date', fieldName: 'Payment_Date__c', type: 'date', typeAttributes: { timeZone: "UTC" }, editable: true },
        { label: 'Project Name', fieldName: 'projectName', type: 'text' }
    ];


    @wire(getDonorsWithPayments)
    wiredDonors({ error, data }) {
        if (data) {

            this.donors = data.map(donor => {
                const paymentsWithProject = donor.payments.map(payment => {
                    const projectName = payment.Project__r ? payment.Project__r.Name : '—';
                    const paymentWithProject = {
                        ...payment,
                        projectName: projectName
                    };
                    return paymentWithProject;
                });
    
                const donorWithDraftValues = {
                    ...donor,
                    payments: paymentsWithProject,
                    draftValues: []
                };

                return donorWithDraftValues;
            });
    
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.donors = undefined;
        }
    }
    
    handleSave(event){
        try {            
            const contactId = event.target.dataset.contactId;
            const draftValues = event.detail.draftValues;
    
        if (!draftValues || !draftValues.length) {
            console.warn('No draft values to save.');
            return;
        }
    
        updatePayments({ updatedPayments: draftValues })
            .then(() => {
                console.log('updatePayments Apex call succeeded');
                this.showToast('Success', 'Payments updated successfully', 'success');
                return refreshApex(this.donors);
            })
            .catch(error => {
                console.error('Error in updatePayments:', error);
                const errorMessage = error?.body?.message || error.message || 'Unknown error';
                this.showToast('Error updating payments', errorMessage, 'error');
            });
        } catch (err) {
            console.error('handleSave error:', err);
        }
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

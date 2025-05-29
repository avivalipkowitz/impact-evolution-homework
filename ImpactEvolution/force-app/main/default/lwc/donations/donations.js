import { LightningElement, wire, track } from 'lwc';
import getDonorsWithPayments from '@salesforce/apex/DonorPaymentsController.getDonorsWithPayments';
import updatePayments from '@salesforce/apex/DonorPaymentsController.updatePayments';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';



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
            console.log('Donors data received:', data);
    
            this.donors = data.map(donor => {
                const paymentsWithProject = donor.payments.map(payment => {
                    const projectName = payment.Project__r ? payment.Project__r.Name : '—';
                    const paymentWithProject = {
                        ...payment,
                        projectName: projectName
                    };
                    return paymentWithProject;
                });
    
                // ✅ Log the payment IDs for debugging
                console.log(`Payments for donor ${donor.contactId}:`, paymentsWithProject.map(p => p.Id));
                console.log('Payments:', donor.payments.map(p => p.Id));

                const donorWithDraftValues = {
                    ...donor,
                    payments: paymentsWithProject,
                    draftValues: []
                };
                console.log(`Draft values initialized for donor ${donor.contactId}:`, donorWithDraftValues.draftValues);

                return donorWithDraftValues;
            });
    
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.donors = undefined;
        }
    }
    
    handleSave(event){
        console.log('this.showToast exists?', typeof this.showToast); // should log: "function"

        try {            
            const contactId = event.target.dataset.contactId;
            const draftValues = event.detail.draftValues;
    
        if (!draftValues || !draftValues.length) {
            console.warn('No draft values to save.');
            return;
        }
        console.log('Saving for contact:', contactId, draftValues);

    
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
        console.log('In SHOWTOAST:');
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(evt);
    }
      
}

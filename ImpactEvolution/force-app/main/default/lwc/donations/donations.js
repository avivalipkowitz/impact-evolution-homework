import { LightningElement, wire, track } from 'lwc';
import getContactsWithPayments from '@salesforce/apex/DonationsController.getContactsWithPayments';
import updatePayments from '@salesforce/apex/DonationsController.updatePayments';
import createPayment from '@salesforce/apex/DonationsController.createPayment';
import insertPayment from '@salesforce/apex/DonationsController.insertPayment';
import deletePayment from '@salesforce/apex/DonationsController.deletePayment';
import getProjects from '@salesforce/apex/DonationsController.getProjects';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';




export default class Donations extends LightningElement {
    @track donors;
    @track error;
    @track showAddPaymentModal = false;
    @track projectOptions;
    @track newPayment = {
        Amount__c: null,
        Payment_Date__c: null,
        Project__c: null,
        Contact__c: null
    };

    wiredDonorsResult;

    columns = [
        { label: 'Amount', fieldName: 'Amount__c', type: 'currency', editable: true},
        { label: 'Payment Date', fieldName: 'Payment_Date__c', type: 'date', typeAttributes: { timeZone: "UTC" }, editable: true },
        { label: 'Project Name', fieldName: 'projectName', type: 'text' },
        {
            type: 'button-icon',
            initialWidth: 50,
            typeAttributes: {
              iconName: 'utility:delete',
              name: 'delete',
              title: 'Delete',
              variant: 'border-filled',
              alternativeText: 'Delete'
            }
          }
    ];


    @wire(getProjects)
    wiredProjects({ error, data }) {
        if (data) {
            this.projectOptions = data.map(project => ({
                label: project.Name,
                value: project.Id
            }));
        } else if (error) {
            console.error('Error fetching projects:', error);
            this.showToast('Error', 'Unable to load projects', 'error');
        }
    }


    // Handle add/delete functionality
    handleAddPayment(event) {
        const contactId = event.target.dataset.contactId;
        this.newPayment = {
          Amount__c: null,
          Payment_Date__c: null,
          Project__c: null,
          Contact__c: contactId
        };
        this.showAddPaymentModal = true;
    }


    handleSaveNewPayment() {
        console.log("Saving new payment: ", JSON.stringify(this.newPayment));
    
        createPayment({ newPayment: this.newPayment })
            .then(result => {
                this.showToast('Success', 'New payment created', 'success');
                this.closeModal();
                return rrefreshApex(this.wiredDonorsResult); 
            })
            .catch(error => {
                console.error('Error saving new payment:', JSON.stringify(error));
                const message = error?.body?.message || error?.message || 'Unknown error';
                this.showToast('Error', message, 'error');
            });
    }

    handleModalCancel() {
        this.showAddPaymentModal = false;
        this.newPayment = {
            Amount__c: null,
            Payment_Date__c: null,
            Project__c: null,
            Contact__c: null
        };
    }

    closeModal(){
        this.handleModalCancel();
    }
      
    handleProjectChange(event) {
        this.newPayment.Project__c = event.detail.value;
    }

    handleAmountChange(event){
        this.newPayment.Amount__c = parseFloat(event.target.value);
    }
    
    handleDateChange(event) {
        this.newPayment.Payment_Date__c = event.target.value;
    }
    
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'delete') {
          this.handleDeletePayment(row.Id);
        }
    }

    handleDeletePayment(paymentId) {
        if (!confirm('Are you sure you want to delete this payment?')) {
          return;
        }
        deletePayment({ paymentId })
          .then(() => {
            console.log('ROW DELETED');
            this.showToast('Success', 'Payment deleted', 'success');
            // return refreshApex(this.wiredDonorsResult); 
            refreshApex(this.wiredDonorsResult).then(() => {
                console.log('Refreshed donors:', JSON.stringify(this.donors));
              });
          })
          .catch(error => {
            this.showToast('Error deleting payment', error.body.message, 'error');
          });
    }


        


    @wire(getContactsWithPayments)
    wiredDonors(result) {
        this.wiredDonorsResult = result;
        const {data, error} = result;
        
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
    
    handleInlineEditSave(event){
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
                return refreshApex(this.wiredDonorsResult); 
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

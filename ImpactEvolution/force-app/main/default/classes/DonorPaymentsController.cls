public with sharing class DonorPaymentsController {
    
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactsWithPayments() {
        return [
            SELECT Id, Name, Total_Payments__c, Most_Recent_Payment_Date__c,
                   (SELECT Id, Amount__c, Payment_Date__c, Project__r.Name 
                    FROM Payments__r)
            FROM Contact
            WHERE Id IN (SELECT Contact__c FROM Payment__c)
        ];
    }

    @AuraEnabled
    public static void savePayments(List<Payment__c> payments) {
        update payments;
    }

    @AuraEnabled
    public static Payment__c createPayment(Payment__c newPayment) {
        insert newPayment;
        return newPayment;
    }

    @AuraEnabled
    public static void deletePayment(Id paymentId) {
        delete [SELECT Id FROM Payment__c WHERE Id = :paymentId LIMIT 1];
    }

    @AuraEnabled(cacheable=true)
    public static List<ContactWrapper> getDonorsWithPayments() {
        List<ContactWrapper> donors = new List<ContactWrapper>();

        // 1. Query all contacts who have made payments
        Set<Id> contactIds = new Set<Id>();
        Map<Id, List<Payment__c>> paymentsByContact = new Map<Id, List<Payment__c>>();

        for (Payment__c payment : [SELECT Id, Amount__c, Payment_Date__c, Contact__c, Project__c, Project__r.Name
                                    FROM Payment__c 
                                    WHERE Contact__c != null]) {
            contactIds.add(payment.Contact__c);

            if (!paymentsByContact.containsKey(payment.Contact__c)) {
                paymentsByContact.put(payment.Contact__c, new List<Payment__c>());
            }
            paymentsByContact.get(payment.Contact__c).add(payment);
        }

        // 2. Query contact info
        List<Contact> contacts = [SELECT Id, Name FROM Contact WHERE Id IN :contactIds];

        for (Contact c : contacts) {
            List<Payment__c> contactPayments = paymentsByContact.get(c.Id);
            Decimal totalAmount = 0;
            Date mostRecent = null;

            for (Payment__c p : contactPayments) {
                totalAmount += p.Amount__c;
                if (mostRecent == null || p.Payment_Date__c > mostRecent) {
                    mostRecent = p.Payment_Date__c;
                }
            }

            donors.add(new ContactWrapper(c.Id, c.Name, totalAmount, mostRecent, contactPayments));
        }
        System.Debug('Donors: ' + donors);
        return donors;
    }

    @AuraEnabled
    public static void updatePayments(List<Payment__c> updatedPayments) {
        if (updatedPayments == null || updatedPayments.isEmpty()) return;

        List<Payment__c> paymentsToUpdate = new List<Payment__c>();

        for (Payment__c payment : updatedPayments) {
            if (payment.Id != null) {
                paymentsToUpdate.add(payment);
            }
        }

        update paymentsToUpdate;
}

}

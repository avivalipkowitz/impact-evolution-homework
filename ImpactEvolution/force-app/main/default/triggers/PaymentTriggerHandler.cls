public class PaymentTriggerHandler {
    public static void updateRollups(List<Payment__c> payments) {
        Set<Id> contactIds = new Set<Id>();
        Set<Id> projectIds = new Set<Id>();

        for (Payment__c payment : payments) {
            if (payment.Contact__c != null) contactIds.add(payment.Contact__c);
            if (payment.Project__c != null) projectIds.add(payment.Project__c);
        }

        if (!contactIds.isEmpty()) updateContactRollups(contactIds);
        if (!projectIds.isEmpty()) updateProjectRollups(projectIds);
    }

    private static void updateContactRollups(Set<Id> contactIds) {
        //Make a new map from Contact ID to AggregateResult
        Map<Id, AggregateResult> results = new Map<Id, AggregateResult>();

        // Query the database for the AggregateResult objects based on the contactIDs passed in, and add the results to the results map
        for (AggregateResult ar : [
            SELECT Contact__c, SUM(Amount__c) totalAmount, MAX(Payment_Date__c) latestDate 
            FROM Payment__c 
            WHERE Contact__c IN :contactIds 
            GROUP BY Contact__c
        ]) {
            results.put((Id) ar.get('Contact__c'), ar);
        }

        // Instatintiate in-memory Contact object to be modified and updated to Salesforce later based on ID number
        List<Contact> contactsToUpdate = new List<Contact>();

        for (Id contactId : contactIds) {
            Contact c = new Contact(Id = contactId);
            AggregateResult ar = results.get(contactId);
            c.Total_Payments__c = ar != null ? (Decimal) ar.get('totalAmount') : 0;
            c.Most_Recent_Payment_Date__c = ar != null ? (Date) ar.get('latestDate') : null;
            contactsToUpdate.add(c);
        }

        if (!contactsToUpdate.isEmpty()) update contactsToUpdate;
    }

    private static void updateProjectRollups(Set<Id> projectIds) {
        Map<Id, AggregateResult> results = new Map<Id, AggregateResult>();

        for (AggregateResult ar : [
            SELECT Project__c, SUM(Amount__c) totalAmount 
            FROM Payment__c 
            WHERE Project__c IN :projectIds 
            GROUP BY Project__c
        ]) {
            results.put((Id) ar.get('Project__c'), ar);
        }

        List<Project__c> projectsToUpdate = new List<Project__c>();

        for (Id projectId : projectIds) {
            Project__c p = new Project__c(Id = projectId);
            AggregateResult ar = results.get(projectId);
            p.Total_Payments__c = ar != null ? (Decimal) ar.get('totalAmount') : 0;
            projectsToUpdate.add(p);
        }

        if (!projectsToUpdate.isEmpty()) update projectsToUpdate;
    }
}

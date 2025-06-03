@isTest
private class PaymentTriggerHandlerTest {
    
    @isTest
    static void testUpdateProjectRollups() {
        // Create test Project
        Project__c proj = new Project__c(Name = 'Test Project');
        insert proj;

        // Create test Contacts
        Contact testContact1 = new Contact(FirstName = 'Test1', LastName = 'User1');
        Contact testContact2 = new Contact(FirstName = 'Test2', LastName = 'User2');

        insert new List<Contact>{testContact1, testContact2};


        // Create two payments related to the project
        Payment__c p1 = new Payment__c(
            Project__c = proj.Id,
            Amount__c = 200,
            Payment_Date__c = Date.today(),
            Contact__c = testContact1.Id
        );
        Payment__c p2 = new Payment__c(
            Project__c = proj.Id,
            Amount__c = 300,
            Payment_Date__c = Date.today().addDays(-10),
            Contact__c = testContact2.Id
        );
        insert new List<Payment__c>{p1, p2};

        // Run handler
        Test.startTest();
        PaymentTriggerHandler.updateRollups(new List<Payment__c>{p1, p2});
        Test.stopTest();

        // Assert rollup result on Project
        Project__c updatedProj = [SELECT Total_Payments__c FROM Project__c WHERE Id = :proj.Id];
        System.assertEquals(500, updatedProj.Total_Payments__c);

        // Assert rollup result on Contact
        Contact updatedContact = [SELECT Total_Payments__c, Most_Recent_Payment_Date__c FROM Contact WHERE Id = :testContact2.Id];
        System.assertEquals(300, updatedContact.Total_Payments__c);
        System.assertEquals(Date.today().addDays(-10), updatedContact.Most_Recent_Payment_Date__c);
    }
}




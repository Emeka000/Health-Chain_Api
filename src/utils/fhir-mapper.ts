export function mapToFhirPatient(patient: any): any {
  return {
    resourceType: 'Patient',
    id: patient.id,
    name: [
      {
        use: 'official',
        family: patient.lastName,
        given: [patient.firstName],
      },
    ],
    gender: patient.gender,
    birthDate: patient.dob,
  };
}

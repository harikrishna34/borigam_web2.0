// src/types/course.ts
export interface Course {
    id: string;
    name: string;
    description: string;
    duration: string;
    fee: string;
    eligibility: string;
    syllabus: string[];
    image: string;
  }
  
  export const courses: Course[] = [
    {
      id: 'nift',
      name: 'NIFT',
      description: 'National Institute of Fashion Technology program focusing on design and fashion technology.',
      duration: '4 Years',
      fee: '₹2,00,000 per year',
      eligibility: '10+2 with 50% marks',
      syllabus: [
        'Fashion Design',
        'Textile Design',
        'Accessory Design',
        'Fashion Communication'
      ],
      image: 'https://via.placeholder.com/300x200?text=NIFT'
    },
    {
      id: 'nid',
      name: 'NID',
      description: 'National Institute of Design program for industrial and communication design.',
      duration: '4 Years',
      fee: '₹1,80,000 per year',
      eligibility: '10+2 with 50% marks',
      syllabus: [
        'Industrial Design',
        'Communication Design',
        'Textile Design',
        'Digital Design'
      ],
      image: 'https://via.placeholder.com/300x200?text=NID'
    },
    // Add other courses (CEED, BARCH, NATA) similarly
  ];
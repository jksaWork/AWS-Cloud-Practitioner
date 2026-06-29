export interface SeedQuestion {
  text: string;
  options: string[];
  correctIndexes: number[];
  explanation?: string | null;
}

export interface SeedExam {
  id: number;
  title: string;
  description: string;
  questions: SeedQuestion[];
}

export const SEED_EXAMS: SeedExam[] = [
  {
    id: 3,
    title: 'AWS Certified Solutions Architect – Associate',
    description:
      'Design resilient, high-performing, secure, and cost-optimized architectures on AWS.',
    questions: [
      {
        text: 'Which S3 storage class is most cost-effective for data accessed infrequently but requiring rapid retrieval?',
        options: [
          'S3 Standard',
          'S3 Intelligent-Tiering',
          'S3 Standard-IA',
          'S3 Glacier Deep Archive',
        ],
        correctIndexes: [2],
      },
      {
        text: 'You need high availability across two Availability Zones. Which architecture pattern should you use?',
        options: [
          'Single EC2 instance with Elastic IP',
          'Auto Scaling group spanning multiple AZs behind an ALB',
          'One RDS instance in a single AZ',
          'Single NAT Gateway in one AZ',
        ],
        correctIndexes: [1],
      },
      {
        text: 'Which service should you use to distribute incoming application traffic across multiple targets?',
        options: ['Amazon Route 53', 'AWS CloudFront', 'Elastic Load Balancing', 'Amazon API Gateway'],
        correctIndexes: [2],
      },
      {
        text: 'What is the recommended way to store database credentials for an EC2 application?',
        options: [
          'Hard-code credentials in application source code',
          'Store credentials in environment variables on the instance',
          'Use AWS Secrets Manager or Systems Manager Parameter Store',
          'Store credentials in a public S3 bucket',
        ],
        correctIndexes: [2],
      },
      {
        text: 'Which VPC component allows instances in private subnets to access the internet?',
        options: ['Internet Gateway', 'NAT Gateway', 'Virtual Private Gateway', 'Direct Connect'],
        correctIndexes: [1],
      },
    ],
  },
  {
    id: 14,
    title: 'AWS Certified DevOps Engineer – Professional',
    description:
      'Provision, operate, and manage distributed application systems on the AWS platform.',
    questions: [
      {
        text: 'Which AWS service is best for implementing CI/CD pipelines?',
        options: ['AWS CodePipeline', 'Amazon SQS', 'AWS CloudTrail', 'Amazon SNS'],
        correctIndexes: [0],
      },
      {
        text: 'You need to deploy infrastructure using templates. Which service should you use?',
        options: ['AWS CloudFormation', 'AWS Config', 'Amazon CloudWatch', 'AWS Trusted Advisor'],
        correctIndexes: [0],
      },
      {
        text: 'Which service collects and tracks configuration changes of AWS resources?',
        options: ['AWS CloudTrail', 'AWS Config', 'Amazon Inspector', 'AWS Systems Manager'],
        correctIndexes: [1],
      },
      {
        text: 'What is the purpose of an Amazon ECS task definition?',
        options: [
          'Define networking rules for a VPC',
          'Specify how containers should run in ECS',
          'Configure S3 bucket policies',
          'Manage IAM user permissions',
        ],
        correctIndexes: [1],
      },
      {
        text: 'Which approach improves deployment safety by routing a small percentage of traffic to a new version first?',
        options: [
          'Blue/green deployment',
          'Canary deployment',
          'Rolling deployment with no health checks',
          'Manual deployment to production',
        ],
        correctIndexes: [1],
      },
    ],
  },
];

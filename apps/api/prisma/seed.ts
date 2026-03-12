import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import {
  ConfidenceLevel,
  EntityStatus,
  EntityType,
  ModerationState,
  ReportChannel,
  ReportOutcome,
  ReportType,
  SectionType,
  SeverityLevel,
  SourceType,
  VerificationState,
  Visibility,
  UserRole,
  PatternStatus,
  PatternType
} from "../src/generated/prisma/enums.js";
import { env } from "../src/config/env.js";
import { slugify } from "../src/utils/slugify.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const admin = await prisma.user.upsert({
    where: { email: "admin@todo.local" },
    update: {
      displayName: "TODO Admin"
    },
    create: {
      email: "admin@todo.local",
      username: "todo-admin",
      displayName: "TODO Admin",
      role: UserRole.ADMIN
    }
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "online-shopping" },
      update: {},
      create: { slug: "online-shopping", name: "Online Shopping" }
    }),
    prisma.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: { slug: "electronics", name: "Electronics" }
    }),
    prisma.category.upsert({
      where: { slug: "telecom" },
      update: {},
      create: { slug: "telecom", name: "Telecom" }
    })
  ]);

  const usedIphone = await prisma.entity.upsert({
    where: { slug: "used-iphone" },
    update: {
      title: "Used iPhone",
      shortDescription: "A second-hand iPhone bought from a private seller or marketplace.",
      longDescription:
        "Used phones are common and useful, but buyers need to understand battery health, iCloud lock status, network lock status, proof of purchase, and marketplace payment risks.",
      entityType: EntityType.OBJECT,
      status: EntityStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
      createdByUserId: admin.id
    },
    create: {
      slug: "used-iphone",
      title: "Used iPhone",
      shortDescription: "A second-hand iPhone bought from a private seller or marketplace.",
      longDescription:
        "Used phones are common and useful, but buyers need to understand battery health, iCloud lock status, network lock status, proof of purchase, and marketplace payment risks.",
      entityType: EntityType.OBJECT,
      status: EntityStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
      createdByUserId: admin.id
    }
  });

  const bankCall = await prisma.entity.upsert({
    where: { slug: "fake-bank-adviser-call" },
    update: {
      title: "Fake Bank Adviser Call",
      shortDescription: "A scam where someone pretends to be your bank and pressures you to act immediately.",
      longDescription:
        "The scammer often creates panic, claims your card or account is compromised, and pushes you to share codes, validate fake operations, or transfer money.",
      entityType: EntityType.SITUATION,
      status: EntityStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
      createdByUserId: admin.id
    },
    create: {
      slug: "fake-bank-adviser-call",
      title: "Fake Bank Adviser Call",
      shortDescription: "A scam where someone pretends to be your bank and pressures you to act immediately.",
      longDescription:
        "The scammer often creates panic, claims your card or account is compromised, and pushes you to share codes, validate fake operations, or transfer money.",
      entityType: EntityType.SITUATION,
      status: EntityStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
      createdByUserId: admin.id
    }
  });

  const fiberSubscription = await prisma.entity.upsert({
    where: { slug: "fiber-subscription" },
    update: {
      title: "Fiber Subscription",
      shortDescription: "A telecom service used to get home internet through fiber infrastructure.",
      longDescription:
        "This service normally includes eligibility checks, installation scheduling, contract terms, pricing conditions, and provider-managed equipment.",
      entityType: EntityType.SERVICE,
      status: EntityStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
      createdByUserId: admin.id
    },
    create: {
      slug: "fiber-subscription",
      title: "Fiber Subscription",
      shortDescription: "A telecom service used to get home internet through fiber infrastructure.",
      longDescription:
        "This service normally includes eligibility checks, installation scheduling, contract terms, pricing conditions, and provider-managed equipment.",
      entityType: EntityType.SERVICE,
      status: EntityStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
      createdByUserId: admin.id
    }
  });

  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]));

  await prisma.entityCategory.createMany({
    data: [
      { entityId: usedIphone.id, categoryId: categoryIdBySlug.get("electronics")! },
      { entityId: usedIphone.id, categoryId: categoryIdBySlug.get("online-shopping")! },
      { entityId: bankCall.id, categoryId: categoryIdBySlug.get("online-shopping")! },
      { entityId: fiberSubscription.id, categoryId: categoryIdBySlug.get("telecom")! }
    ],
    skipDuplicates: true
  });

  await prisma.entitySection.createMany({
    data: [
      {
        entityId: usedIphone.id,
        sectionType: SectionType.DEFINITION,
        title: "What it is",
        content: "A used iPhone is a previously owned Apple smartphone sold again through a private seller, refurbisher, or marketplace.",
        sortOrder: 1,
        sourceConfidence: ConfidenceLevel.HIGH
      },
      {
        entityId: usedIphone.id,
        sectionType: SectionType.NORMAL_PROCESS,
        title: "Normal buying process",
        content: "A normal purchase includes checking serial/IMEI status, battery health, activation lock status, visible condition, and a safe payment method with proof of sale.",
        sortOrder: 2,
        sourceConfidence: ConfidenceLevel.MEDIUM
      },
      {
        entityId: usedIphone.id,
        sectionType: SectionType.RED_FLAGS,
        title: "Red flags",
        content: "Seller refuses to show IMEI, asks for deposit before seeing the phone, avoids meeting in person, or pushes off-platform payment.",
        sortOrder: 3,
        sourceConfidence: ConfidenceLevel.MEDIUM
      },
      {
        entityId: bankCall.id,
        sectionType: SectionType.DEFINITION,
        title: "What is happening",
        content: "A fake bank adviser call is a fraud attempt where the caller pretends to be your bank to manipulate you into taking risky actions.",
        sortOrder: 1,
        sourceConfidence: ConfidenceLevel.HIGH
      },
      {
        entityId: bankCall.id,
        sectionType: SectionType.COMMON_SCAMS,
        title: "Common scam path",
        content: "The scammer creates urgency, says suspicious transfers were spotted, and then asks you to validate operations or move money to a so-called safe account.",
        sortOrder: 2,
        sourceConfidence: ConfidenceLevel.HIGH
      },
      {
        entityId: bankCall.id,
        sectionType: SectionType.WHAT_TO_DO_IF_AFFECTED,
        title: "What to do",
        content: "Hang up, contact your bank through official channels, freeze affected means of payment if needed, and preserve any proof like phone number, screenshots, or messages.",
        sortOrder: 3,
        sourceConfidence: ConfidenceLevel.HIGH
      },
      {
        entityId: fiberSubscription.id,
        sectionType: SectionType.DEFINITION,
        title: "What it is",
        content: "A fiber subscription is a contract with an internet service provider to deliver broadband access over fiber-optic infrastructure.",
        sortOrder: 1,
        sourceConfidence: ConfidenceLevel.HIGH
      },
      {
        entityId: fiberSubscription.id,
        sectionType: SectionType.NORMAL_PROCESS,
        title: "Normal process",
        content: "A provider checks eligibility, explains the offer, confirms pricing and commitments, schedules installation, and sends written contractual details.",
        sortOrder: 2,
        sourceConfidence: ConfidenceLevel.HIGH
      }
    ],
    skipDuplicates: true
  });

  const source = await prisma.source.create({
    data: {
      sourceType: SourceType.INTERNAL_ANALYSIS,
      title: "Starter seed knowledge",
      publisher: "TODO",
      notes: "Seed source for the first local starter dataset.",
      reliabilityScore: 0.6,
      retrievedAt: new Date()
    }
  });

  const sections = await prisma.entitySection.findMany({
    where: {
      entityId: {
        in: [usedIphone.id, bankCall.id, fiberSubscription.id]
      }
    }
  });

  await prisma.sectionSourceLink.createMany({
    data: sections.map((section: { id: string }) => ({
      sectionId: section.id,
      sourceId: source.id
    })),
    skipDuplicates: true
  });

  await prisma.entityTrustStatus.upsert({
    where: { entityId: usedIphone.id },
    update: {
      factualConfidence: ConfidenceLevel.HIGH,
      communitySignalStrength: ConfidenceLevel.LOW,
      moderationConfidence: ConfidenceLevel.MEDIUM,
      reviewedByUserId: admin.id,
      lastReviewedAt: new Date(),
      notes: "Starter trust status for initial public page."
    },
    create: {
      entityId: usedIphone.id,
      factualConfidence: ConfidenceLevel.HIGH,
      communitySignalStrength: ConfidenceLevel.LOW,
      moderationConfidence: ConfidenceLevel.MEDIUM,
      reviewedByUserId: admin.id,
      lastReviewedAt: new Date(),
      notes: "Starter trust status for initial public page."
    }
  });

  const report = await prisma.experienceReport.create({
    data: {
      entityId: bankCall.id,
      reportType: ReportType.SCAM_ATTEMPT,
      title: "Caller pushed for urgent action",
      narrative:
        "The caller claimed to be from my bank, said fraudulent transfers had started, and pressured me to validate steps immediately. The panic and urgency were the main warning signs.",
      happenedAt: new Date(),
      countryCode: "FR",
      region: "Île-de-France",
      city: "Paris",
      channel: ReportChannel.PHONE_CALL,
      outcome: ReportOutcome.SAFE,
      severityLevel: SeverityLevel.HIGH,
      verificationState: VerificationState.UNVERIFIED,
      moderationState: ModerationState.PENDING,
      isAnonymous: true,
      isPublic: true
    }
  });

  const pattern = await prisma.patternCard.upsert({
    where: { slug: slugify("Urgent fake bank adviser pressure") },
    update: {
      title: "Urgent fake bank adviser pressure",
      summary: "Reports mention fake advisers creating panic and pushing immediate actions before the victim can verify anything.",
      reportCount: 1,
      confidenceScore: 0.65,
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      humanReviewed: false,
      status: PatternStatus.DRAFT
    },
    create: {
      slug: slugify("Urgent fake bank adviser pressure"),
      title: "Urgent fake bank adviser pressure",
      summary: "Reports mention fake advisers creating panic and pushing immediate actions before the victim can verify anything.",
      patternType: PatternType.SCAM_PATTERN,
      severityLevel: SeverityLevel.HIGH,
      reportCount: 1,
      confidenceScore: 0.65,
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      aiGenerated: true,
      humanReviewed: false,
      status: PatternStatus.DRAFT
    }
  });

  await prisma.patternEntityLink.upsert({
    where: {
      patternId_entityId: {
        patternId: pattern.id,
        entityId: bankCall.id
      }
    },
    update: {
      relevanceScore: 0.95
    },
    create: {
      patternId: pattern.id,
      entityId: bankCall.id,
      relevanceScore: 0.95
    }
  });

  await prisma.patternReportLink.upsert({
    where: {
      patternId_reportId: {
        patternId: pattern.id,
        reportId: report.id
      }
    },
    update: {
      aiScore: 0.92,
      humanValidated: false
    },
    create: {
      patternId: pattern.id,
      reportId: report.id,
      aiScore: 0.92,
      humanValidated: false
    }
  });

  console.log("Seed completed successfully.");
}

main()
  .catch(async (error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

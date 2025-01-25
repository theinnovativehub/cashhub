import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// function generateDummyTasks(count: number){
// 	return Array.from({ length: count }, (_, index) => ({
// 		id: `ad-${index + 1}`,
// 		title: `Advertisement ${index + 1}`,
// 		description: `This is a sample advertisement description for ad ${
// 			index + 1
// 		}. Click to learn more and earn rewards!`,
// 		reward: Math.floor(Math.random() * (50 - 10 + 1)) + 10,
// 		clientId: `client-${Math.floor(Math.random() * 10) + 1}`,
// 		imageUrl: `https://picsum.photos/seed/${index + 1}/400/300`,
// 		targetViews: 1000,
// 		currentViews: Math.floor(Math.random() * 1000),
// 		status: "active" as const,
// 		createdAt: new Date(
// 			Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
// 		),
// 	}));
// }

// export const dummyAds = generateDummyTasks(50);
export const mockAds: any[] = [{
  id: `ad-1`,
  title: `Christmas Advertisement`,
  description: `An amazing ad for the Christmas season. Click to learn more and earn rewards!`,
  // taskUrl: `https://picsum.photos/seed/1/400/300`,
  // updatedAt:new Date(),
  completions: [
    {
      userId: "user-1",
      status: "completed" as const,
      submittedAt: new Date(),
    }
  ],
  isActive: false,
  category: "visit",
  reward: 500,
//   clientId: `client-${Math.floor(Math.random() * 10) + 1}`,
//   imageUrl: `https://picsum.photos/seed/1/400/300`,
//   targetViews: 1000,
//   currentViews: Math.floor(Math.random() * 1000),
  status: "active" as const,
  createdAt: new Date(
    Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
  ),
},
{
  id: `ad-2`,
  title: `New Year Advertisement`,
  description: `An amazing ad for the New Year 2025. Click to gain more insights and earn amazing rewards!`,
  reward: 700,
  // taskUrl: `https://picsum.photos/seed/1/400/300`,
  // updatedAt: new Date(),
  completions: [
    {
      userId: "user-1",
      status: "completed" as const,
      submittedAt: new Date(),
    }
  ],
  isActive: false,
  category: "visit",
//   clientId: `client-${Math.floor(Math.random() * 10) + 1}`,
//   imageUrl: `https://picsum.photos/seed/2/400/300`,
//   targetViews: 1000,
//   currentViews: Math.floor(Math.random() * 1000),
  status: "active" as const,
  createdAt: new Date(
    Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
  ),
},
{
  id: `ad-3`,
  title: `Back-To-School Advertisement`,
  description: `Its School Time!!. Check out this amazing task about kids and earn some cash while you do. Click to learn more and earn rewards!`,
  reward: 700,
  // taskUrl: `https://picsum.photos/seed/1/400/300`,
  // updatedAt: Timestamp.fromDate(new Date()),
  completions: [
    {
      userId: "user-1",
      status: "completed" as const,
      submittedAt: new Date(),
    }
  ],
  isActive: false,
  category: "visit",
//   clientId: `client-${Math.floor(Math.random() * 10) + 1}`,
//   imageUrl: `https://picsum.photos/seed/3/400/300`,
//   targetViews: 1000,
//   currentViews: Math.floor(Math.random() * 1000),
  status: "active" as const,
  createdAt: new Date(
    Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
  ),
}]
// Curated sample data for PrepPocket interactive portfolio demo
export const initialNotes = [
  {
    _id: "demo_note_1",
    title: "Binary Search: Invariants & Edge Cases",
    link: "https://leetcode.com/discuss/general-discussion/786126/python-powerful-ultimate-binary-search-template",
    content: "Key rule: Keep search space invariant. While low <= high: mid = low + Math.floor((high - low) / 2). Understand lower_bound (first element >= target) vs upper_bound (first element > target) to avoid off-by-one errors.",
    tags: ["Algorithm", "Binary Search", "Templates"],
    type: "N",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: "demo_note_2",
    title: "Dynamic Programming: Space Optimization Patterns",
    link: "https://cp-algorithms.com/dynamic_programming/intro-to-dp.html",
    content: "When dp[i][j] only relies on row dp[i-1][...], collapse the 2D grid into two 1D rows (prev and curr), reducing auxiliary space from O(N * M) to O(M). Remember to iterate backwards for 0/1 knapsack 1D compression.",
    tags: ["DP", "Optimization", "Space Complexity"],
    type: "N",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: "demo_note_3",
    title: "Fast & Slow Pointers (Floyd's Cycle Detection)",
    link: "https://en.wikipedia.org/wiki/Cycle_detection",
    content: "Tortoise & Hare: Advance slow by 1 step and fast by 2 steps. If they meet, a cycle exists. To find cycle head: reset slow to head, advance both by 1 step; their intersection is the exact cycle entrance.",
    tags: ["Linked List", "Pointers", "Pattern"],
    type: "N",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    _id: "demo_note_4",
    title: "Monotonic Stack Strategy & Next Greater Element",
    link: "https://leetcode.com/discuss/study-guide/2347639/A-comprehensive-guide-and-template-for-monotonic-stack-based-problems",
    content: "Maintain a strictly increasing or decreasing stack to solve nearest greater/smaller problems in O(N) linear time. Essential for histogram problems, stock spans, and daily temperatures.",
    tags: ["Stack", "Monotonic", "Technique"],
    type: "N",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    _id: "demo_note_5",
    title: "Consistent Hashing & Virtual Nodes in Distributed Systems",
    link: "https://github.com/donnemartin/system-design-primer",
    content: "Maps servers and keys to a 360-degree hash ring. Virtual nodes distribute load uniformly and prevent hot-spotting when instances join or leave the cluster.",
    tags: ["System Design", "Distributed Systems"],
    type: "N",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialQuestions = [
  {
    _id: "demo_q_1",
    title: "Trapping Rain Water (LeetCode #42)",
    link: "https://leetcode.com/problems/trapping-rain-water/",
    content: "Used two pointers (left and right) with leftMax and rightMax trackers. Water volume depends on min(leftMax, rightMax) - height[i]. Solved in O(N) time and O(1) space.",
    tags: ["Two Pointers", "Hard", "LeetCode"],
    type: "Q",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    _id: "demo_q_2",
    title: "LRU Cache (LeetCode #146)",
    link: "https://leetcode.com/problems/lru-cache/",
    content: "Combined a hash map for O(1) key lookups with a doubly linked list for O(1) node repositioning. Most recently used nodes move to head; tail node evicted when exceeding capacity.",
    tags: ["Design", "Hash Map", "Doubly Linked List"],
    type: "Q",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: "demo_q_3",
    title: "Course Schedule II (LeetCode #210)",
    link: "https://leetcode.com/problems/course-schedule-ii/",
    content: "Constructed adjacency graph and in-degree array. Applied Kahn's BFS algorithm: courses with 0 in-degree queued first. Cycle detected if processed count < total courses.",
    tags: ["Graph", "BFS", "Topological Sort"],
    type: "Q",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    _id: "demo_q_4",
    title: "Word Break (LeetCode #139)",
    link: "https://leetcode.com/problems/word-break/",
    content: "Bottom-up 1D DP: dp[i] is true if s[0...i] can be formed by valid dictionary words. Optimized inner loop by checking only word lengths present in the dictionary.",
    tags: ["DP", "String", "Medium"],
    type: "Q",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    _id: "demo_q_5",
    title: "Merge k Sorted Lists (LeetCode #23)",
    link: "https://leetcode.com/problems/merge-k-sorted-lists/",
    content: "Utilized a min-heap / priority queue storing heads of all k lists. Extracted the minimum element in O(log k) and advanced pointer until all lists were merged.",
    tags: ["Heap", "Divide & Conquer", "Hard"],
    type: "Q",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

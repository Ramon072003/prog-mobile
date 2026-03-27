export const createClient = jest.fn(() => ({
  auth: {
    signInWithPassword: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: "test.jpg" }, error: null }),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: "https://test.com/test.jpg" } })),
    })),
  },
}));

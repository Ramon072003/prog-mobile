import { WorkoutExercise, MediaSyncStatus } from "../WorkoutExercise";

describe("WorkoutExercise Entity", () => {
  it("should create a valid workout exercise", () => {
    const we = new WorkoutExercise({
      id: "1",
      workout_id: "w1",
      exercise_id: "e1",
      sets: 3,
      reps: 10,
      weight: 60,
      media_sync: MediaSyncStatus.PENDING,
    });

    expect(we.sets).toBe(3);
    expect(we.weight).toBe(60);
    expect(we.media_sync).toBe(MediaSyncStatus.PENDING);
  });

  it("should throw error if sets is zero", () => {
    expect(() => {
      new WorkoutExercise({
        id: "1",
        workout_id: "w1",
        exercise_id: "e1",
        sets: 0,
        reps: 10,
        weight: 60,
        media_sync: MediaSyncStatus.PENDING,
      });
    }).toThrow("As séries devem ser maiores que zero.");
  });

  it("should throw error if weight is negative", () => {
    expect(() => {
      new WorkoutExercise({
        id: "1",
        workout_id: "w1",
        exercise_id: "e1",
        sets: 3,
        reps: 10,
        weight: -1,
        media_sync: MediaSyncStatus.PENDING,
      });
    }).toThrow("O peso não pode ser negativo.");
  });

  it("should update media status to uploaded", () => {
    const we = new WorkoutExercise({
      id: "1",
      workout_id: "w1",
      exercise_id: "e1",
      sets: 3,
      reps: 10,
      weight: 60,
      media_sync: MediaSyncStatus.PENDING,
    });

    we.setMediaUploaded("https://supabase.com/photo.jpg");

    expect(we.media_sync).toBe(MediaSyncStatus.UPLOADED);
    expect(we.media_url).toBe("https://supabase.com/photo.jpg");
  });
});

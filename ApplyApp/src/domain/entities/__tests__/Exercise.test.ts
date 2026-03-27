import { Exercise } from "../Exercise";

describe("Exercise Entity", () => {
  it("should create a valid exercise", () => {
    const exercise = new Exercise({
      id: "1",
      name: "Supino Reto",
      muscle_group: "Peito",
    });

    expect(exercise.name).toBe("Supino Reto");
    expect(exercise.muscle_group).toBe("Peito");
  });

  it("should throw error if name is empty", () => {
    expect(() => {
      new Exercise({
        id: "1",
        name: "",
        muscle_group: "Peito",
      });
    }).toThrow("O nome do exercício é obrigatório.");
  });

  it("should throw error if muscle_group is empty", () => {
    expect(() => {
      new Exercise({
        id: "1",
        name: "Supino Reto",
        muscle_group: " ",
      });
    }).toThrow("O grupo muscular é obrigatório.");
  });
});

import Foundation

/// One answered check-in question. Prompt text is captured at entry time so
/// historical entries keep their original question context even if the
/// question set changes later.
public struct BiofeedbackAnswer: Codable, Sendable, Equatable {
    public let questionID: String
    public let prompt: String
    /// 1 (worst) ... 5 (best).
    public let score: Int

    public init(questionID: String, prompt: String, score: Int) {
        self.questionID = questionID
        self.prompt = prompt
        self.score = score
    }
}

/// A daily biofeedback check-in, tagged with the phase it was recorded under.
public struct BiofeedbackEntry: Codable, Sendable, Identifiable, Equatable {
    public let id: UUID
    public var date: Date
    public var phase: Phase
    public var answers: [BiofeedbackAnswer]

    public init(id: UUID = UUID(), date: Date, phase: Phase, answers: [BiofeedbackAnswer]) {
        self.id = id
        self.date = date
        self.phase = phase
        self.answers = answers
    }

    public func validate() throws {
        guard !answers.isEmpty else {
            throw StoreError.invalidBiofeedbackEntry(reason: "Entry has no answers")
        }
        for answer in answers {
            guard !answer.questionID.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
                throw StoreError.invalidBiofeedbackEntry(reason: "Answer has empty questionID")
            }
            guard !answer.prompt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
                throw StoreError.invalidBiofeedbackEntry(
                    reason: "Answer \(answer.questionID) has empty prompt"
                )
            }
            guard (1 ... 5).contains(answer.score) else {
                throw StoreError.invalidBiofeedbackEntry(
                    reason: "Score \(answer.score) for \(answer.questionID) outside 1–5"
                )
            }
        }
    }
}

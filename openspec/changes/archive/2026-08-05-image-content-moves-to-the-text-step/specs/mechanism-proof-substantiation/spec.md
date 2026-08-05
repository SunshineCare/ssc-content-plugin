## MODIFIED Requirements

### Requirement: The writer, the producer and the authority carry the same chain, and the authority caps rather than rejects

`ssc-ads-writer`, `ssc-post-produce` and `ssc-post-authority` SHALL all carry the
hook → mechanism → proof chain, and SHALL ship together. `ssc-ads-writer` SHALL
**compose** to it and **score** it. `ssc-post-produce` SHALL **compose** to it and
**record** it, and SHALL score nothing: on the post channel the entire scored gate lives
in `ssc-post-authority`, which SHALL **judge** it — and its criterion SHALL **cap** the
candidate's rating rather than reject it, unlike the other criteria on its `copy`
judgement list, which are rejections.

For `image_content` the criterion is carried by **`ssc-image-prompt-text`**, which authors
that section on both channels, and it SHALL apply only where the version's bullets carry the
mechanism's proof. Where the chosen **density profile emits no bullets**, the criterion SHALL
be **inert** — not a miss, not a cap, and not a reason to push the set toward a denser
profile than the chain tip admits. Like the authority's, this criterion SHALL cap the
candidate's rating rather than reject it.

The authority grades what the producer writes. Shipping one without the other makes the
authority judge posts against a bar the writer was never given — a guaranteed stream of
findings on work that was composed correctly under the rules it actually had. The
capping-not-rejecting exception exists for the same reason it exists on the producer side:
the authority's rejections are compliance and hard-refusal machinery, and a persuasion
weakness routed through it would drop sound candidates over a judgement call. A version
whose profile carries no bullets has no place to put the proof, and the profile is chosen
from the image the block will sit on — so a criterion that fired there would push the payload
past what that image can legibly hold.

#### Scenario: All three copy skills state the rule

- **WHEN** the change's diff is read
- **THEN** `ssc-ads-writer`, `ssc-post-produce` and `ssc-post-authority` each state the
  proof-backed mechanism rule for the sections they produce
- **AND** none of the three ships without the others

#### Scenario: The on-image author carries the same rule

- **WHEN** `ssc-image-prompt-text` judges an `image_content` candidate whose bullets carry the
  mechanism's proof but name no traced proof row
- **THEN** the candidate's rating is capped at 3 or below and the reason is named
- **AND** the candidate is not rejected and no replacement slot is opened

#### Scenario: The authority caps an unbacked candidate

- **WHEN** `ssc-post-authority` judges a `copy` candidate whose mechanism beat names no
  traced proof row
- **THEN** the candidate's rating is capped at 3 or below and the reason is named
- **AND** the candidate is **not** rejected, not sent back to the rejection loop, and not
  removed from the set

#### Scenario: A bullet-less image_content version is not faulted

- **WHEN** the chosen density profile emits no bullets
- **THEN** the proof-backing criterion is inert for that version
- **AND** it is recorded as neither a miss nor a cap, and the payload is not pushed to a
  denser profile

#### Scenario: The authority's other criteria are unchanged

- **WHEN** `ssc-post-authority` applies its other `copy` criteria — mechanism presence,
  opening frame, close job, urgency, fabricated real-person material
- **THEN** each still carries the consequence it carries today
- **AND** only the proof-backing criterion caps instead of rejecting

## Verification checklist

- [ ] `plan.md` exists, covers every sentence in the cut, and states the coverage percentage
- [ ] No stretch over 45s without b-roll, none over 25s without the speaker's face, no two clips back to back
- [ ] Every clip's header answers what it adds that the sentence did not say
- [ ] Sound is cut from the same named constants as the picture, one voice per event
- [ ] The clock came from the composition SRT, and the duration was re-checked before naming
- [ ] Every beat that carries an idea has its own clip, including the payoff clause
- [ ] Three designs per beat, identical frame counts
- [ ] Real logos and real terms wherever the thing being drawn exists
- [ ] A still was rendered and looked at for every phase of every clip, in both frames
- [ ] Four files exist per landscape clip: wide opaque, wide alpha, narrow opaque, narrow alpha
- [ ] The wide still is byte-identical before and after the narrow variant was added
- [ ] Every rendered file was watched with `scripts/watch.py` and the last pass returned nothing
- [ ] Nothing sits below y=1650 that the viewer needs to see
- [ ] Every clip's last element resolves before the cut, with hold frames after it
- [ ] Each clip's header quotes the line it serves and argues its design
- [ ] New failure modes from this run were appended to Learned Patterns

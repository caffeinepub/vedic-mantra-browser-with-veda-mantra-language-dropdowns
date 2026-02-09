import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type Language = {
    #telugu;
    #english;
    #hindi;
  };

  type Translation = {
    telugu : Text;
    english : Text;
    hindi : Text;
  };

  type Veda = {
    #rikVeda;
    #yajurVeda;
    #samaVeda;
    #atharvaVeda;
  };

  type Mantra = {
    veda : Veda;
    mantraNumber : Nat;
  };

  type OldMantraEntry = {
    veda : Veda;
    mantraNumber : Nat;
    meaning : Translation;
  };

  type NewMantraWithTranslation = {
    translation : Text;
    meaning : Text;
  };

  type NewMantraWithTranslations = {
    telugu : NewMantraWithTranslation;
    english : NewMantraWithTranslation;
    hindi : NewMantraWithTranslation;
  };

  type NewMantraEntry = {
    veda : Veda;
    mantraNumber : Nat;
    translations : NewMantraWithTranslations;
  };

  type OldActor = {
    mantraMeanings : Map.Map<Mantra, Translation>;
    seedData : [OldMantraEntry];
  };

  type NewActor = {
    mantras : Map.Map<Mantra, NewMantraWithTranslations>;
  };

  public func run(old : OldActor) : NewActor {
    let newMantras = old.mantraMeanings.map<Mantra, Translation, NewMantraWithTranslations>(
      func(_mantra, oldTranslation) {
        {
          telugu = {
            translation = oldTranslation.telugu;
            meaning = oldTranslation.telugu;
          };
          english = {
            translation = oldTranslation.english;
            meaning = oldTranslation.english;
          };
          hindi = {
            translation = oldTranslation.hindi;
            meaning = oldTranslation.hindi;
          };
        };
      }
    );

    { mantras = newMantras };
  };
};

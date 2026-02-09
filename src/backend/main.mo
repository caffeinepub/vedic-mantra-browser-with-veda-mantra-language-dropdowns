import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Order "mo:core/Order";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type Language = {
    #telugu;
    #english;
    #hindi;
  };

  type MantraWithTranslation = {
    translation : Text;
    meaning : Text;
  };

  type MantraWithTranslations = {
    telugu : MantraWithTranslation;
    english : MantraWithTranslation;
    hindi : MantraWithTranslation;
  };

  type Veda = {
    #rikVeda;
    #yajurVeda;
    #samaVeda;
    #atharvaVeda;
  };

  type MantraMetadata = {
    telugu : Text;
    hindi : Text;
    english : Text;
  };

  type Mantra = {
    veda : Veda;
    mantraNumber : Nat;
  };

  module Mantra {
    public func compare(x : Mantra, y : Mantra) : Order.Order {
      switch (x.veda) {
        case (#rikVeda) {
          switch (y.veda) {
            case (#rikVeda) { Nat.compare(x.mantraNumber, y.mantraNumber) };
            case (_) { #less };
          };
        };
        case (#yajurVeda) {
          switch (y.veda) {
            case (#rikVeda) { #greater };
            case (#yajurVeda) { Nat.compare(x.mantraNumber, y.mantraNumber) };
            case (_) { #less };
          };
        };
        case (#samaVeda) {
          switch (y.veda) {
            case (#atharvaVeda) { #less };
            case (#samaVeda) { Nat.compare(x.mantraNumber, y.mantraNumber) };
            case (_) { #greater };
          };
        };
        case (#atharvaVeda) {
          switch (y.veda) {
            case (#atharvaVeda) { Nat.compare(x.mantraNumber, y.mantraNumber) };
            case (_) { #greater };
          };
        };
      };
    };
  };

  var mantras = Map.fromIter<Mantra, MantraWithTranslations>(
    [
      (
        { veda = #samaVeda; mantraNumber = 47 },
        {
          telugu = {
            translation = "అదర్శి న యఖ్జవిత్తమః\nయస్మిన్ వ్రత్యాని ఆదధుః\nఉపో షు జాత మార్యస్య వర్థనం అగ్నిం నక్షంతు\nనో గిరః  ";
            meaning = "సాహసస్తమైన యజ్ఞద్రవ్యాన్ని పొందిన గారు గుర్తించబడ్డారు.\nఆయన ఆచరణతో మన కర్తవ్యాలను ఒకచోట చేర్చారు.\nమీ కొత్త తేజస్సుతో మాతో చేరిన మీరు\nమా ప్రార్థనలను వినగలరో";
          };
          english = {
            translation = "adarśi nā yakhjavittamaḥ, yasmīn vratyāni ādadhuḥ, upo ṣu jāta māryasya vardhanaṃ agniṃ nakṣantu, no giraḥ  ";
            meaning = "The bravest among us, who had attained the means of sacrifice, has been recognized. His conduct has united our duties. If, with your newfound radiance, you join us, may you hear our prayers.";
          };
          hindi = {
            translation = "अदर्शि गातुवित्तमो यस्मिन्व्रतान्यादधुः\nउपो षु जातमार्यस्य वर्धनमग्निं नक्षन्तु नो गिरः";
            meaning = "हमारे बीच सबसे साहसी, जिन्होंने यज्ञ के साधनों को प्राप्त कर लिया था, उनकी पहचान हो गई है। उनके आचरण ने हमारे कर्तव्यों को एकजुट कर दिया है। यदि आप अपनी नई चमक के साथ हमारे साथ आ जाते हैं, तो कृपया हमारी प्रार्थनाएं सुन लें।  (४७)";
          };
        },
      ),
      (
        { veda = #samaVeda; mantraNumber = 48 },
        {
          telugu = {
            translation = "ఉరాధ్మానమహన్ ప్రి యో భర పునర్హిన్ వర్షపత్నం ప్రి యః ప్రి యం శ విషయం దైద భృ అంటూ పి తరం ముషాత్య నో గిరః";
            meaning = "పునర్నిర్మిం చడం మనకు ఆనందాన్ని తెస్తుంది మీరు మేఘాలను మళ్లీ నింపుతారు మీరు చూస్తారు వారిని మందంగా ఉంచండి పరిపూర్ణం చేయండి మీ శక్తిని ఉపయోగించండి మమ్మల్ని మరలా తడవండి మీ మేఘంగా మేఘపుటద్వార పైనుండి మాపై జల్లించండి మేఘంల మరలా ముప్పుతెన్ వారనునట్టిుగ";
          };
          english = {
            translation = "urāḍhmānamaḥan priyo bhara, punarhin varṣapatnaṃ, priyaḥ, priyaṃ ś viṣayaṃ, daida bhṛ ante pitaraṃ, muṣāty, ano giraḥ  ";
            meaning = "Return brings us joy. You refill the clouds. You see them heavy, complete. Use your force to drench us again, rain down from above through your cloud cover, so that we have the clouds again.";
          };
          hindi = {
            translation = "उराघमानमहन् प्रियो भर पुनर्हिन वृषपत्नम् । प्रियो प्रियम् विशयं दैदभ्रि अन्ते पितरं मुषात्यनो गिरः ।";
            meaning = "वापसी हमें खुशी देती है। आप बादलों को फिर से भर देते हैं। आप उन्हें भारी, पूर्ण देखते हैं। अपनी शक्ति का उपयोग करके हमें फिर से भिंगो दीजिए। अपनी बादल की आड़ से ऊपर से वर्षा करें, ताकि हमारे पास फिर से बादल हों (४८)।";
          };
        },
      ),
    ].values(),
  );

  var mantraMetadata = Map.fromIter<Mantra, MantraMetadata>(
    [
      (
        { veda = #samaVeda; mantraNumber = 47 },
        {
          telugu = "దేవత: అగ్నిః ఋషిః సౌభారి: కాణ్వః ఛందస్: బృహతీ స్వరః మధ్యమః కాండ: అగ్నేయం కాండం";
          english = "Deity: Agni, Rishi: Soubhari Kanva, Meter: Brihati, Svara: Madhyama, Kanda: Agneya Kanda";
          hindi = "देवता: अग्निः ऋषि: सौभरि: काण्व: छन्द: बृहती स्वर: मध्यमः काण्ड: आग्नेयं काण्डम्";
        },
      ),
      (
        { veda = #samaVeda; mantraNumber = 48 },
        {
          telugu = "48 వ మంత్రానికి వివరాలు ఇంకా అందుబాటులో లేవు. దయచేసి తర్వాత ప్రయత్నించండి.";
          english = "Mantra 48 metadata details currently unavailable. Please check again later.";
          hindi = "मंत्र 48 विवरण वर्तमान में अनुपलब्ध है। कृपया बाद में फिर से जाँच करें।";
        },
      ),
    ].values(),
  );

  let mantraAudioFiles = Map.empty<Mantra, Storage.ExternalBlob>();

  var templates = Map.empty<Mantra, Text>();
  var existingMantraNumbers : [(Veda, Nat)] = [];

  public query ({ caller }) func getMantraNumbers(veda : Veda) : async [Nat] {
    let filtered = mantras.keys().toArray().filter(func(entry) { entry.veda == veda });

    let sorted = filtered.sort(
      func(lhs, rhs) {
        if (lhs.mantraNumber < rhs.mantraNumber) {
          return #less;
        } else if (lhs.mantraNumber > rhs.mantraNumber) {
          return #greater;
        };
        #equal;
      }
    );

    let mapped = sorted.map(func(mantra) { mantra.mantraNumber });

    mapped;
  };

  public query ({ caller }) func getAllMantraNumbersForVeda(veda : Veda) : async [Nat] {
    let mantraNumbersFromExistingMantraNumbers = switch (existingMantraNumbers.find(func((v, _lastMantraNumber)) { v == veda })) {
      case (?(_, lastMantraNumber)) { Array.tabulate(lastMantraNumber, func(i) { i + 1 }) };
      case (null) { [] };
    };

    let mantraNumbersFromMantras = mantras.keys().toArray().filter(func(entry) { entry.veda == veda });
    let sorted = mantraNumbersFromMantras.sort(
      func(lhs, rhs) {
        if (lhs.mantraNumber < rhs.mantraNumber) {
          return #less;
        } else if (lhs.mantraNumber > rhs.mantraNumber) {
          return #greater;
        };
        #equal;
      }
    );
    let mapped = sorted.map(func(mantra) { mantra.mantraNumber });

    let result = mantraNumbersFromExistingMantraNumbers.concat(mapped);

    result;
  };

  public query ({ caller }) func getMantraMeaning(
    veda : Veda,
    mantraNumber : Nat,
    language : Language,
  ) : async ?Text {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    switch (mantras.get(k)) {
      case (null) { null };
      case (?translations) {
        switch (language) {
          case (#telugu) { ?translations.telugu.meaning };
          case (#english) { ?translations.english.meaning };
          case (#hindi) { ?translations.hindi.meaning };
        };
      };
    };
  };

  public query ({ caller }) func getMantraText(
    veda : Veda,
    mantraNumber : Nat,
    language : Language,
  ) : async ?Text {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    switch (mantras.get(k)) {
      case (null) { null };
      case (?translations) {
        switch (language) {
          case (#telugu) { ?translations.telugu.translation };
          case (#english) { ?translations.english.translation };
          case (#hindi) { ?translations.hindi.translation };
        };
      };
    };
  };

  public query ({ caller }) func getMantraMetadata(
    veda : Veda,
    mantraNumber : Nat,
    language : Language,
  ) : async ?Text {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    switch (mantraMetadata.get(k)) {
      case (null) { null };
      case (?metadata) {
        switch (language) {
          case (#telugu) { ?metadata.telugu };
          case (#english) { ?metadata.english };
          case (#hindi) { ?metadata.hindi };
        };
      };
    };
  };

  public shared ({ caller }) func addMantraAudioFile(
    veda : Veda,
    mantraNumber : Nat,
    blob : Storage.ExternalBlob,
  ) : async () {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    mantraAudioFiles.add(k, blob);
  };

  public query ({ caller }) func getMantraAudioFile(
    veda : Veda,
    mantraNumber : Nat,
  ) : async ?Storage.ExternalBlob {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    mantraAudioFiles.get(k);
  };

  public query ({ caller }) func getMantraTemplate(
    veda : Veda,
    mantraNumber : Nat,
  ) : async ?Text {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    templates.get(k);
  };

  public shared ({ caller }) func submitTemplate(
    veda : Veda,
    mantraNumber : Nat,
    template : Text,
  ) : async [Nat] {
    let k : Mantra = {
      veda;
      mantraNumber;
    };
    templates.add(k, template);

    let currentLastMantraNumber = switch (existingMantraNumbers.find(func((v, _lastMantraNumber)) { v == veda })) {
      case (?(_v, lastMantraNumber)) { lastMantraNumber };
      case (null) { 0 };
    };

    let newLastMantraNumber = if (mantraNumber > currentLastMantraNumber) {
      mantraNumber;
    } else { currentLastMantraNumber };

    existingMantraNumbers := existingMantraNumbers.filter(
      func((v, _lastMantraNumber)) { v != veda }
    ).concat([(veda, newLastMantraNumber)]);

    await getMantraNumbers(veda);
  };

  type Diagnostics = {
    mantraCount : Nat;
    metadataCount : Nat;
    samaveda47Exists : Bool;
    samaveda48Exists : Bool;
  };

  public query ({ caller }) func getBackendDiagnostics() : async Diagnostics {
    {
      mantraCount = mantras.size();
      metadataCount = mantraMetadata.size();
      samaveda47Exists = mantras.containsKey({ veda = #samaVeda; mantraNumber = 47 });
      samaveda48Exists = mantras.containsKey({ veda = #samaVeda; mantraNumber = 48 });
    };
  };
};

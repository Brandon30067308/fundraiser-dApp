const FundraiserFactoryContract = artifacts.require("FundraiserFactory");
const FundraiserContract = artifacts.require("Fundraiser");

contract("FundraiserFactory: fundraisers", (accounts) => {
  async function createFundraiserFactory(fundraisersCount, accounts) {
    const factory = await FundraiserFactoryContract.new();
    await addFundraisers(factory, fundraisersCount, accounts);
    return factory;
  }

  async function addFundraisers(factory, count, accounts) {
    const name = "Beneficiary";
    const lowerCaseName = name.toLowerCase();
    const beneficiary = accounts[1];

    for (let i = 0; i < count; i++) {
      await factory.createFundraiser(
        `${name} ${i}`,
        `${lowerCaseName}${i}.com`,
        `${lowerCaseName}${i}.png`,
        `Description for ${name} ${i}`,
        beneficiary
      );
    }
  }

  describe("when fundraisers collection is empty", async () => {
    it("returns an empty collection", async () => {
      const factory = await createFundraiserFactory(0, accounts);
      const fundraisers = await factory.fundraisers(10, 0);
      assert.equal(fundraisers.length, 0, "collection should be empty");
    });
  });

  describe("varying limits", async () => {
    let factory;

    beforeEach(async () => {
      factory = await createFundraiserFactory(20, accounts);
    });

    it("returns 10 results when limit requested is 10", async () => {
      const fundraisers = await factory.fundraisers(10, 0);
      assert.equal(fundraisers.length, 10, "results size should be 10");
    });

    it("returns 20 results when limit requested is 20", async () => {
      const fundraisers = await factory.fundraisers(20, 0);
      assert.equal(fundraisers.length, 20, "results size should be 20");
    });

    it("returns 20 results when limit requested is 30", async () => {
      const fundraisers = await factory.fundraisers(30, 0);
      assert.equal(fundraisers.length, 20, "results size should be 20");
    });
  });

  describe("varying offset", async () => {
    let factory;
    beforeEach(async () => {
      factory = await createFundraiserFactory(10, accounts);
    });

    it("contains the fundraiser with the appropriate offset", async () => {
      const fundraisers = await factory.fundraisers(1, 0);
      const fundraiser = await FundraiserContract.at(fundraisers[0]);
      const name = await fundraiser.name();
      console.log("fundraiser name->>", name);
      assert.ok(await name.includes(0), `${name} did not include the offset`);
    });

    it("contains the fundraiser with the appropriate offset", async () => {
      const fundraisers = await factory.fundraisers(1, 7);
      const fundraiser = await FundraiserContract.at(fundraisers[0]);
      const name = await fundraiser.name();
      assert.ok(await name.includes(7), `${name} did not include the offset`);
    });
  });
});

contract("FundraiserFactory: deployment", () => {
  let fundraiserFactory;

  beforeEach(async () => {
    fundraiserFactory = await FundraiserFactoryContract.deployed();
  });

  it("has been deployed", async () => {
    assert(fundraiserFactory, "fundraiser factory was not deployed");
  });
});

contract("FundraiserFactory: createFundraiser", (accounts) => {
  let fundraiserFactory;

  beforeEach(async () => {
    fundraiserFactory = await FundraiserFactoryContract.deployed();
  });

  const name = "Beneficiary Name";
  const url = "beneficiaryname.org";
  const imageURL = "https://placekitten.com/600/350";
  const bio = "Beneficiary Description";
  const beneficiary = accounts[1];

  it("increments the fundraisersCount", async () => {
    const currentFundraisersCount = await fundraiserFactory.fundraisersCount();
    console.log("init count->>", currentFundraisersCount);
    await fundraiserFactory.createFundraiser(
      name,
      url,
      imageURL,
      bio,
      beneficiary
    );
    const newFundraisersCount = await fundraiserFactory.fundraisersCount();
    console.log("new count->>", newFundraisersCount);

    assert.equal(
      newFundraisersCount - currentFundraisersCount,
      1,
      "should increment by 1"
    );
  });
});

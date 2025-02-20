import { Test, TestingModule } from '@nestjs/testing';
import { P2pGateway } from './p2p.gateway';

describe('P2pGateway', () => {
  let gateway: P2pGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [P2pGateway],
    }).compile();

    gateway = module.get<P2pGateway>(P2pGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
